from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from collections import defaultdict
from ..database import get_db
from ..models import User, Submission, Task, Room
from ..schemas import DashboardResponse, ActivityEntry, DailyXP, LeaderboardEntry, RoomXP
from ..utils.auth import get_current_user
from ..utils.game_logic import get_daily_multiplier

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("", response_model=DashboardResponse)
def get_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Aggregate dashboard statistics for the current user.
    Returns total XP, level, streak, completed quests, daily XP breakdown,
    room XP, recent activities, and global leaderboard.
    """
    
    # Fetch all user submissions
    user_submissions = db.query(Submission).filter(
        Submission.user_id == user.id
    ).order_by(Submission.timestamp).all()
    
    # Calculate XP by room FIRST (this is the source of truth for multipliers)
    xp_by_room_data = []
    submissions_by_room = defaultdict(list)
    
    for submission in user_submissions:
        task = db.query(Task).filter(Task.id == submission.task_id).first()
        if task:
            submissions_by_room[task.room_id].append(submission)
            
    total_xp = 0 # This will be the sum of room XPs
    
    for room_id, room_subs in submissions_by_room.items():
        room = db.query(Room).filter(Room.id == room_id).first()
        if room:
            # Calculate room XP with daily multipliers (Per Room Rule)
            room_subs_by_day = defaultdict(list)
            for sub in room_subs:
                day = sub.timestamp.date()
                room_subs_by_day[day].append(sub)
            
            room_xp = 0
            for day, subs in room_subs_by_day.items():
                daily_base = sum(s.xp_awarded for s in subs)
                multiplier = get_daily_multiplier(len(subs))
                room_xp += int(daily_base * multiplier)
            
            # Add to GLOBAL TOTAL
            total_xp += room_xp
            
            xp_by_room_data.append(RoomXP(
                room_id=room.id,
                room_name=room.name,
                room_code=room.code,
                xp=room_xp
            ))
            
    # Calculate daily breakdown for chart (Visualization only)
    # We can still show "XP earned on Day X", but we should probably sum the Room-XP-contributions for that day?
    # Or just show raw daily base * multiplier logic?
    # To be consistent with total_xp, we really should sum "XP earned in Room A on Day X" + "XP earned in Room B on Day X".
    
    xp_by_day_dict = defaultdict(int)
    for room_id, room_subs in submissions_by_room.items():
         room_subs_by_day = defaultdict(list)
         for sub in room_subs:
             day = sub.timestamp.date()
             room_subs_by_day[day].append(sub)
         
         for day, subs in room_subs_by_day.items():
             daily_base = sum(s.xp_awarded for s in subs)
             multiplier = get_daily_multiplier(len(subs))
             final_daily_room_xp = int(daily_base * multiplier)
             xp_by_day_dict[day] += final_daily_room_xp

    xp_by_day_data = [DailyXP(date=d.isoformat(), xp=xp) for d, xp in sorted(xp_by_day_dict.items())]

    # Calculate level (100 XP per level)
    level = (total_xp // 100) + 1
    
    # Calculate streak (consecutive days with submissions)
    # Streak logic is loose (just checking for any submission)
    current_streak = 0
    if user_submissions:
        # Group ANY submission by day for streak check
        streak_days = sorted(list(set(s.timestamp.date() for s in user_submissions)), reverse=True)
        today = datetime.now().date()
               
        # Check if there's activity today or yesterday
        if streak_days[0] >= today - timedelta(days=1):
            current_streak = 1
            prev_day = streak_days[0]
            
            for day in streak_days[1:]:
                if (prev_day - day).days == 1:
                    current_streak += 1
                    prev_day = day
                else:
                    break
    
    # Quests completed
    quests_completed = len(user_submissions)
    
    # Recent activities
    recent_activities = []
    recent_subs = user_submissions[-5:][::-1]  # Last 5, reversed
    
    for submission in recent_subs:
        task = db.query(Task).filter(Task.id == submission.task_id).first()
        room = db.query(Room).filter(Room.id == task.room_id).first() if task else None
        
        if task and room:
            recent_activities.append(ActivityEntry(
                quest_title=task.title,
                room_name=room.name,
                xp_earned=submission.xp_awarded,
                timestamp=submission.timestamp
            ))
    
    # Optimized Global Leaderboard (Top 10)
    # Must use SAME aggregation logic: Sum of Room XPs
    
    # 1. Get all submissions join Task to get Room ID
    all_subs_query = db.query(Submission, Task.room_id).join(Task, Submission.task_id == Task.id).all()
    
    # 2. Build map: User -> Room -> Day -> List[Sub]
    # user_room_day_map[uid][rid][date] = [subs...]
    user_room_day_map = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))
    
    for sub, rid in all_subs_query:
        d = sub.timestamp.date()
        user_room_day_map[sub.user_id][rid][d].append(sub)
        
    # 3. Calculate Scores
    user_xp_map = defaultdict(int)
    for uid, rooms in user_room_day_map.items():
        user_total = 0
        for rid, days in rooms.items():
            for d, subs in days.items():
                base = sum((s.xp_awarded or 0) for s in subs)
                mult = get_daily_multiplier(len(subs))
                user_total += int(base * mult)
        user_xp_map[uid] = user_total

    # Get user details for the top XP earners
    sorted_user_ids = sorted(user_xp_map.keys(), key=lambda uid: user_xp_map[uid], reverse=True)
    top_u_ids = sorted_user_ids[:10]
    
    top_users = db.query(User).filter(User.id.in_(top_u_ids)).all()
    user_info = {u.id: {"username": u.username, "email": u.email} for u in top_users}
    
    top_adventurers = []
    for idx, uid in enumerate(top_u_ids):
        if uid in user_info:
            top_adventurers.append(LeaderboardEntry(
                user_id=uid,
                username=user_info[uid]["username"],
                email=user_info[uid]["email"],
                total_xp=user_xp_map[uid],
                rank=idx + 1
            ))
            
    # Calculate current user's global rank
    global_rank = None
    if user.id in user_xp_map:
        # Find index in sorted list
        global_rank = sorted_user_ids.index(user.id) + 1
    else:
        # If user has no submissions/XP, check if they exist in sorted list (no)
        # Rank is effectively "Last"
        global_rank = len(sorted_user_ids) + 1
    
    return DashboardResponse(
        total_xp=total_xp,
        level=level,
        current_streak=current_streak,
        quests_completed=quests_completed,
        xp_by_day=xp_by_day_data[-30:],  # Last 30 days
        xp_by_room=xp_by_room_data,
        recent_activities=recent_activities,
        top_adventurers=top_adventurers,
        global_rank=global_rank
    )


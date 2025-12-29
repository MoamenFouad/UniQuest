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
    
    # Calculate total XP with daily multipliers
    total_xp = 0
    submissions_by_day = defaultdict(list)
    
    for submission in user_submissions:
        day = submission.timestamp.date()
        submissions_by_day[day].append(submission)
    
    # Apply daily multipliers
    xp_by_day_data = []
    for day, subs in sorted(submissions_by_day.items()):
        daily_base = sum(s.xp_awarded for s in subs)
        multiplier = get_daily_multiplier(len(subs))
        daily_total = int(daily_base * multiplier)
        total_xp += daily_total
        xp_by_day_data.append(DailyXP(date=day.isoformat(), xp=daily_total))
    
    # Calculate XP by room
    xp_by_room_data = []
    submissions_by_room = defaultdict(list)
    
    for submission in user_submissions:
        task = db.query(Task).filter(Task.id == submission.task_id).first()
        if task:
            submissions_by_room[task.room_id].append(submission)
    
    for room_id, room_subs in submissions_by_room.items():
        room = db.query(Room).filter(Room.id == room_id).first()
        if room:
            # Calculate room XP with daily multipliers
            room_subs_by_day = defaultdict(list)
            for sub in room_subs:
                day = sub.timestamp.date()
                room_subs_by_day[day].append(sub)
            
            room_xp = 0
            for day, subs in room_subs_by_day.items():
                daily_base = sum(s.xp_awarded for s in subs)
                multiplier = get_daily_multiplier(len(subs))
                room_xp += int(daily_base * multiplier)
            
            xp_by_room_data.append(RoomXP(
                room_id=room.id,
                room_name=room.name,
                room_code=room.code,
                xp=room_xp
            ))
    
    # Calculate level (100 XP per level)
    level = (total_xp // 100) + 1
    
    # Calculate streak (consecutive days with submissions)
    current_streak = 0
    if submissions_by_day:
        sorted_days = sorted(submissions_by_day.keys(), reverse=True)
        today = datetime.now().date()
        
        # Check if there's activity today or yesterday
        if sorted_days[0] >= today - timedelta(days=1):
            current_streak = 1
            prev_day = sorted_days[0]
            
            for day in sorted_days[1:]:
                if (prev_day - day).days == 1:
                    current_streak += 1
                    prev_day = day
                else:
                    break
    
    # Quests completed
    quests_completed = len(user_submissions)
    
    # Recent activities (last 5 submissions)
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
    # Fetch all submissions to calculate XP globally
    # In a real production app with millions of subs, we'd use a more specialized query or cached stats.
    # For this project, fetching all subs is acceptable and much faster than N+1 queries.
    
    all_submissions = db.query(Submission).order_by(Submission.user_id, Submission.timestamp).all()
    user_xp_map = defaultdict(int)
    user_subs_by_day = defaultdict(lambda: defaultdict(list))
    
    for sub in all_submissions:
        day = sub.timestamp.date()
        user_subs_by_day[sub.user_id][day].append(sub)
    
    for user_id, days_map in user_subs_by_day.items():
        total_u_xp = 0
        for day, subs in days_map.items():
            daily_base = sum(s.xp_awarded for s in subs)
            multiplier = get_daily_multiplier(len(subs))
            total_u_xp += int(daily_base * multiplier)
        user_xp_map[user_id] = total_u_xp
        
    # Get user details for the top XP earners
    # Limit to top 20 first to be safe, then sort and take top 10
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
        # If user has no submissions, they are at the end
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


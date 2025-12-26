from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from ..database import get_db
from ..models import Room, RoomMember, User, Submission, Task
from ..schemas import RoomCreate, RoomResponse, LeaderboardEntry
from ..utils.auth import get_current_user
from ..utils.game_logic import get_daily_multiplier
from sqlalchemy import func
from itertools import groupby

router = APIRouter(prefix="/rooms", tags=["rooms"])

@router.post("/", response_model=RoomResponse)
def create_room(room_in: RoomCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    code = str(uuid.uuid4())[:8].upper()
    room = Room(name=room_in.name, code=code, admin_id=user.id)
    db.add(room)
    db.commit()
    db.refresh(room)
    
    # Add admin as member
    member = RoomMember(user_id=user.id, room_id=room.id, is_admin=True)
    db.add(member)
    db.commit()
    
    return room

@router.post("/join")
def join_room(code: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    member = db.query(RoomMember).filter(RoomMember.user_id == user.id, RoomMember.room_id == room.id).first()
    if member:
        return {"message": "Already joined"}
        
    member = RoomMember(user_id=user.id, room_id=room.id, is_admin=False)
    db.add(member)
    db.commit()
    return {"message": "Joined successfully", "room_id": room.id}

@router.get("/my", response_model=List[RoomResponse])
def get_my_rooms(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Construct response manually to include archived status from the association table
    rooms_data = []
    for member in user.room_memberships:
        room_data = member.room
        # Create a dict-like object or modify the object if it's transient
        # Safest way with Pydantic from_attributes is to ensure the attribute exists
        # We can dynamically add it here
        room_data.is_archived = member.archived
        rooms_data.append(room_data)
    
    return rooms_data

@router.get("/{code}/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(code: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    members = db.query(User).join(RoomMember).filter(RoomMember.room_id == room.id).all()
    leaderboard = []
    
    for member in members:
        # FIX: Only get submissions for tasks in THIS room, not all rooms
        submissions = (
            db.query(Submission)
            .join(Task)
            .filter(
                Submission.user_id == member.id,
                Task.room_id == room.id  # This is the critical fix!
            )
            .order_by(Submission.timestamp)
            .all()
        )
        
        # Group by day
        total_xp = 0
        submissions_by_day = {}
        for s in submissions:
            d = s.timestamp.date()
            if d not in submissions_by_day:
                submissions_by_day[d] = []
            submissions_by_day[d].append(s)
            
        for d, subs in submissions_by_day.items():
            daily_base = sum(s.xp_awarded for s in subs)
            multiplier = get_daily_multiplier(len(subs))
            total_xp += int(daily_base * multiplier)
            
        leaderboard.append(LeaderboardEntry(
            user_id=member.id,
            username=member.username,
            total_xp=total_xp,
            rank=0
        ))
        
    leaderboard.sort(key=lambda x: x.total_xp, reverse=True)
    for i, entry in enumerate(leaderboard):
        entry.rank = i + 1
        
    return leaderboard

@router.get("/global/leaderboard", response_model=List[LeaderboardEntry])
def get_global_leaderboard(db: Session = Depends(get_db)):
    # Aggregate XP across all rooms
    submissions = db.query(Submission).all()
    
    # Calculate XP per user
    user_xp = {}
    
    for s in submissions:
        # We need to apply daily multipliers logic globally?
        # The prompt says "Multiplier applies to total daily XP".
        # If we just sum up everything, we might miss the daily grouping context if user submitted across different rooms.
        # However, for MVP, we'll assume the same logic: group by user, then by day.
        
        # Optimization: Query all users first?
        # Let's iterate efficiently.
        pass

    # Better approach:
    # 1. Fetch all users
    # 2. For each user, fetch submissions
    # 3. Calculate daily XP with multiplier
    
    users = db.query(User).all()
    leaderboard = []
    
    for user in users:
        user_submissions = db.query(Submission).filter(Submission.user_id == user.id).all()
        
        total_xp = 0
        submissions_by_day = {}
        for s in user_submissions:
            d = s.timestamp.date()
            if d not in submissions_by_day:
                submissions_by_day[d] = []
            submissions_by_day[d].append(s)
            
        for d, subs in submissions_by_day.items():
            daily_base = sum(s.xp_awarded for s in subs)
            multiplier = get_daily_multiplier(len(subs))
            total_xp += int(daily_base * multiplier)
            
        leaderboard.append(LeaderboardEntry(
            user_id=user.id,
            username=user.username,
            total_xp=total_xp,
            rank=0
        ))
        
    leaderboard.sort(key=lambda x: x.total_xp, reverse=True)
    for i, entry in enumerate(leaderboard):
        entry.rank = i + 1
        
    return leaderboard

@router.get("/{code}", response_model=RoomResponse)
def get_room_details(code: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    # Check if user is a member to get archived status
    member = db.query(RoomMember).filter(
        RoomMember.user_id == user.id,
        RoomMember.room_id == room.id
    ).first()
    
    if member:
        room.is_archived = member.archived
    else:
        room.is_archived = False
        
    return room

@router.post("/{code}/leave")
def leave_room(code: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Leave a room"""
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Check if user is admin
    if room.admin_id == user.id:
        raise HTTPException(status_code=400, detail="Admin cannot leave the room. Transfer ownership or delete the room instead.")
    
    member = db.query(RoomMember).filter(
        RoomMember.user_id == user.id,
        RoomMember.room_id == room.id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Not a member of this room")
    
    db.delete(member)
    db.commit()
    return {"message": "Left room successfully"}

@router.post("/{code}/archive")
def archive_room(code: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Archive a room for the current user"""
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    member = db.query(RoomMember).filter(
        RoomMember.user_id == user.id,
        RoomMember.room_id == room.id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Not a member of this room")
    
    member.archived = True
    db.commit()
    return {"message": "Room archived successfully"}

@router.post("/{code}/unarchive")
def unarchive_room(code: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Unarchive a room for the current user"""
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    member = db.query(RoomMember).filter(
        RoomMember.user_id == user.id,
        RoomMember.room_id == room.id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Not a member of this room")
    
    member.archived = False
    db.commit()
    return {"message": "Room unarchived successfully"}

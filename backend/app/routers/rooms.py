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
from collections import defaultdict

router = APIRouter(prefix="/rooms", tags=["rooms"])

@router.post("/", response_model=RoomResponse)
def create_room(room_in: RoomCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    code = str(uuid.uuid4())[:8].upper()
    room = Room(
        name=room_in.name, 
        description=room_in.description,
        is_public=room_in.is_public,
        code=code, 
        admin_id=user.id
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    
    # Add admin as member
    member = RoomMember(user_id=user.id, room_id=room.id, is_admin=True)
    db.add(member)
    db.commit()
    
    return room

from ..schemas import RoomUpdate, RoomMemberResponse, RoomMemberUpdate

@router.patch("/{code}", response_model=RoomResponse)
def update_room(code: str, room_in: RoomUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    code = code.strip().upper()
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Check if user is admin of the room
    member = db.query(RoomMember).filter(RoomMember.user_id == user.id, RoomMember.room_id == room.id).first()
    if not member or not member.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can update room settings")
    
    if room_in.name is not None:
        room.name = room_in.name
    if room_in.description is not None:
        room.description = room_in.description
    if room_in.is_public is not None:
        room.is_public = room_in.is_public
        
    db.commit()
    db.refresh(room)
    return room

@router.delete("/{code}")
def delete_room(code: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    code = code.strip().upper()
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Only room creator or admin can delete
    member = db.query(RoomMember).filter(RoomMember.user_id == user.id, RoomMember.room_id == room.id).first()
    if not member or not member.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can delete the room")
    
    db.delete(room)
    db.commit()
    return {"message": "Room deleted successfully"}

@router.get("/{code}/members", response_model=List[RoomMemberResponse])
def get_room_members(code: str, db: Session = Depends(get_db)):
    code = code.strip().upper()
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    members = db.query(RoomMember).filter(RoomMember.room_id == room.id).all()
    
    res = []
    for m in members:
        res.append({
            "id": m.id,
            "user_id": m.user_id,
            "room_id": m.room_id,
            "is_admin": m.is_admin,
            "username": m.user.username,
            "email": m.user.email
        })
    return res

@router.patch("/{code}/members/{user_id}/role", response_model=RoomMemberResponse)
def update_member_role(code: str, user_id: int, role_in: RoomMemberUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    code = code.strip().upper()
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Check if requester is admin
    requester = db.query(RoomMember).filter(RoomMember.user_id == user.id, RoomMember.room_id == room.id).first()
    if not requester or not requester.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can change roles")
    
    target_member = db.query(RoomMember).filter(RoomMember.user_id == user_id, RoomMember.room_id == room.id).first()
    if not target_member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Prevent demoting the last admin if possible, but for now just update
    target_member.is_admin = role_in.is_admin
    db.commit()
    db.refresh(target_member)
    
    return {
        "id": target_member.id,
        "user_id": target_member.user_id,
        "room_id": target_member.room_id,
        "is_admin": target_member.is_admin,
        "username": target_member.user.username,
        "email": target_member.user.email
    }

@router.post("/join")
def join_room(code: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    code = code.strip().upper()
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

@router.post("/{code}/leave")
def leave_room(code: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    code = code.strip().upper()
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    member = db.query(RoomMember).filter(RoomMember.user_id == user.id, RoomMember.room_id == room.id).first()
    if not member:
        raise HTTPException(status_code=400, detail="You are not a member of this room")
        
    db.delete(member)
    db.commit()
    return {"message": "Left room successfully"}

@router.get("/my", response_model=List[RoomResponse])
def get_my_rooms(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [member.room for member in user.room_memberships]

@router.get("/{code}/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(code: str, db: Session = Depends(get_db)):
    code = code.strip().upper()
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Fetch all submissions for tasks in this room
    room_submissions = db.query(Submission).join(Task).filter(Task.room_id == room.id).all()
    
    user_xp_map = defaultdict(int)
    user_subs_by_day = defaultdict(lambda: defaultdict(list))
    
    for sub in room_submissions:
        day = sub.timestamp.date()
        user_subs_by_day[sub.user_id][day].append(sub)
        
    for user_id, days_map in user_subs_by_day.items():
        total_u_xp = 0
        for day, subs in days_map.items():
            daily_base = sum((s.xp_awarded or 0) for s in subs)
            multiplier = get_daily_multiplier(len(subs))
            total_u_xp += int(daily_base * multiplier)
        user_xp_map[user_id] = total_u_xp

    # Also include room members who have 0 XP
    members = db.query(User).join(RoomMember).filter(RoomMember.room_id == room.id).all()
    
    leaderboard = []
    for member in members:
        leaderboard.append(LeaderboardEntry(
            user_id=member.id,
            username=member.username,
            email=member.email or "",
            total_xp=user_xp_map[member.id],
            rank=0
        ))
        
    leaderboard.sort(key=lambda x: x.total_xp, reverse=True)
    for i, entry in enumerate(leaderboard):
        entry.rank = i + 1
        
    return leaderboard

@router.get("/global/leaderboard", response_model=List[LeaderboardEntry])
def get_global_leaderboard(db: Session = Depends(get_db)):
    # Aggregate XP across all rooms
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
    users_info = {} # quick lookup map
    
    # Get all user objects first to avoid N+1 if possible, or just query as needed
    # Better: get distinct user IDs first
    all_uids = list(user_room_day_map.keys())
    if all_uids:
        users = db.query(User).filter(User.id.in_(all_uids)).all()
        for u in users:
            users_info[u.id] = u
    
    for uid, rooms in user_room_day_map.items():
        user_total = 0
        for rid, days in rooms.items():
            for d, subs in days.items():
                base = sum((s.xp_awarded or 0) for s in subs)
                mult = get_daily_multiplier(len(subs))
                user_total += int(base * mult)
        user_xp_map[uid] = user_total

    leaderboard = []
    
    for uid, total_xp in user_xp_map.items():
        if uid in users_info:
            user = users_info[uid]
            leaderboard.append(LeaderboardEntry(
                user_id=user.id,
                username=user.username,
                email=user.email or "",
                total_xp=total_xp,
                rank=0
            ))
        
    leaderboard.sort(key=lambda x: x.total_xp, reverse=True)
    for i, entry in enumerate(leaderboard):
        entry.rank = i + 1
        
    return leaderboard

@router.get("/{code}", response_model=RoomResponse)
def get_room_details(code: str, db: Session = Depends(get_db)):
    code = code.strip().upper()
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

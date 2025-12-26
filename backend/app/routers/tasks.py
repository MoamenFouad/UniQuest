from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..models import Task, Room, RoomMember, User
from ..schemas import TaskCreate, TaskResponse
from ..utils.auth import get_current_user

router = APIRouter(prefix="/rooms/{code}/tasks", tags=["tasks"])

@router.post("/", response_model=TaskResponse)
def create_task(code: str, task_in: TaskCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    member = db.query(RoomMember).filter(RoomMember.user_id == user.id, RoomMember.room_id == room.id).first()
    if not member or not member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can create tasks")
        
    task = Task(**task_in.dict(), room_id=room.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("", response_model=List[TaskResponse])
def list_tasks(code: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    tasks = room.tasks
    
    # Annotate tasks
    results = []
    for task in tasks:
        # Check submission
        is_submitted = any(s.user_id == user.id for s in task.submissions)
        
        # Check expiration (safe timezone comparison)
        is_expired = False
        if task.deadline:
            # tasks.deadline is timezone aware (DateTime(timezone=True))
            # Compare with current UTC time
            now = datetime.now(task.deadline.tzinfo) if task.deadline.tzinfo else datetime.utcnow()
            if task.deadline < now:
                is_expired = True

        # Create response object explictly to include annotated fields
        results.append(TaskResponse(
            id=task.id,
            room_id=task.room_id,
            title=task.title,
            description=task.description,
            type=task.type,
            xp_value=task.xp_value,
            deadline=task.deadline,
            start_time=task.start_time,
            end_time=task.end_time,
            created_at=task.created_at,
            is_submitted=is_submitted,
            is_expired=is_expired,
            completed=is_submitted
        ))
        
    return results

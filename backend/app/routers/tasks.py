from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
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

@router.get("/", response_model=List[TaskResponse])
def list_tasks(code: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    return room.tasks

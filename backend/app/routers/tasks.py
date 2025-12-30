from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import shutil
import os
import uuid
from ..database import get_db
from ..models import Task, Room, RoomMember, User, Submission
from ..schemas import TaskCreate, TaskResponse, SubmissionResponse
from ..utils.auth import get_current_user
from ..config import settings

router = APIRouter(prefix="/rooms/{code}/tasks", tags=["tasks"])

@router.post("/", response_model=TaskResponse)
def create_task(code: str, task_in: TaskCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    member = db.query(RoomMember).filter(RoomMember.user_id == user.id, RoomMember.room_id == room.id).first()
    if not member or not member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can create tasks")
        
    # Assign XP based on task type
    xp_value = 100 if task_in.type == "lecture" else 75
    
    task_data = task_in.dict()
    task_data['xp_value'] = xp_value
    
    task = Task(**task_data, room_id=room.id)
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
        # Get user's submission for this task
        submission = next((s for s in task.submissions if s.user_id == user.id), None)
        is_submitted = submission is not None
        submission_status = submission.status if submission else None
        
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
            submission_status=submission_status,
            is_expired=is_expired,
            completed=is_submitted
        ))
        
    return results

@router.post("/{task_id}/submit/", response_model=SubmissionResponse)
async def submit_task_nested(
    code: str,
    task_id: int,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    task = db.query(Task).filter(Task.id == task_id, Task.room_id == room.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    # Check if already submitted
    existing = db.query(Submission).filter(Submission.task_id == task_id, Submission.user_id == user.id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already submitted")

    # Check expiration
    if task.deadline:
        now = datetime.now(task.deadline.tzinfo) if task.deadline.tzinfo else datetime.utcnow()
        if task.deadline < now:
            raise HTTPException(status_code=403, detail="Mission expired")

    # Save file
    if not os.path.exists(settings.UPLOAD_DIR):
        os.makedirs(settings.UPLOAD_DIR)
        
    filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    submission = Submission(
        task_id=task_id,
        user_id=user.id,
        file_path=filename,
        xp_awarded=0,
        status="pending"
    )
    
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    return submission

@router.get("/{task_id}/submissions", response_model=List[SubmissionResponse])
def list_task_submissions(code: str, task_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    member = db.query(RoomMember).filter(RoomMember.user_id == user.id, RoomMember.room_id == room.id).first()
    if not member or not member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can view submissions")
        
    submissions = db.query(Submission).filter(Submission.task_id == task_id).all()
    return submissions

@router.post("/{task_id}/submissions/{submission_id}/verify", response_model=SubmissionResponse)
def verify_submission(code: str, task_id: int, submission_id: int, status: str = "verified", user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    member = db.query(RoomMember).filter(RoomMember.user_id == user.id, RoomMember.room_id == room.id).first()
    if not member or not member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can verify submissions")
        
    submission = db.query(Submission).filter(Submission.id == submission_id, Submission.task_id == task_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    if status not in ["verified", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    submission.status = status
    if status == "verified":
        # Award the XP specified in the task
        task = db.query(Task).filter(Task.id == task_id).first()
        submission.xp_awarded = task.xp_value or 0
    else:
        submission.xp_awarded = 0
        
    db.commit()
    db.refresh(submission)
    return submission

@router.delete("/{task_id}")
def delete_task(code: str, task_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    member = db.query(RoomMember).filter(RoomMember.user_id == user.id, RoomMember.room_id == room.id).first()
    if not member or not member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete tasks")
        
    task = db.query(Task).filter(Task.id == task_id, Task.room_id == room.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}

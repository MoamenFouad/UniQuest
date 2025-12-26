from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime
import shutil
import os
import uuid
from ..database import get_db
from ..models import Submission, Task, User
from ..schemas import SubmissionResponse
from ..utils.auth import get_current_user
from ..config import settings

router = APIRouter(prefix="/submissions", tags=["submissions"])

@router.post("/{task_id}", response_model=SubmissionResponse)
async def submit_task(
    task_id: int,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    # Check if already submitted
    existing = db.query(Submission).filter(Submission.task_id == task_id, Submission.user_id == user.id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already submitted")

    # Save file
    filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    submission = Submission(
        task_id=task_id,
        user_id=user.id,
        file_path=filename,
        xp_awarded=task.xp_value
    )
    
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    return submission

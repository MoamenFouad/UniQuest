from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserResponse
from ..utils.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=UserResponse)
def login(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_in.username).first()
    if not user:
        user = User(username=user_in.username, student_id=user_in.student_id)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    request.session["user_id"] = user.id
    return user

@router.post("/logout")
def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out"}

@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return user

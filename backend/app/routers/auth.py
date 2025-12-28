from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserResponse, UserLogin, UserUpdate, FirebaseLogin
from ..utils.auth import get_current_user, get_password_hash, verify_password
from ..utils.firebase import verify_firebase_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=UserResponse)
def signup(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    # Check if user already exists
    user = db.query(User).filter(
        (User.username == user_in.username) | 
        (User.email == user_in.email)
    ).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this username or email already exists"
        )
    
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        student_id=user_in.student_id,
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    request.session["user_id"] = new_user.id
    return new_user

@router.post("/login", response_model=UserResponse)
def login(user_in: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == user_in.identifier) | 
        (User.email == user_in.identifier)
    ).first()
    
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password"
        )
    
    request.session["user_id"] = user.id
    return user

@router.post("/firebase-login", response_model=UserResponse)
def firebase_login(login_in: FirebaseLogin, request: Request, db: Session = Depends(get_db)):
    print(f"DEBUG: Attempting Firebase login with provider: {login_in.provider}")
    # Verify token
    try:
        decoded_token = verify_firebase_token(login_in.id_token)
    except HTTPException as e:
        print(f"DEBUG: Verification failed: {e.detail}")
        raise e
    except Exception as e:
        print(f"DEBUG: Unexpected verification error: {str(e)}")
        raise HTTPException(status_code=401, detail=str(e))

    email = decoded_token.get("email")
    uid = decoded_token.get("uid")
    name = decoded_token.get("name") or decoded_token.get("email").split("@")[0]
    print(f"DEBUG: Token verified for email: {email}, uid: {uid}, name: {name}")

    if not email:
        raise HTTPException(status_code=400, detail="Firebase token missing email")

    # 1. Existing user with this Firebase UID
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if user:
        request.session["user_id"] = user.id
        return user

    # 2. Existing user with this email (Link them)
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.firebase_uid = uid
        # If they use a social login, we can mark it as their primary provider
        # or just keep traditional if they had a password
        if user.provider == "traditional":
             user.provider = login_in.provider
        db.commit()
        db.refresh(user)
        request.session["user_id"] = user.id
        return user

    # 3. New user
    # Generate unique username if taken
    base_username = name.replace(" ", "_").lower()
    username = base_username
    counter = 1
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1

    new_user = User(
        username=username,
        email=email,
        firebase_uid=uid,
        provider=login_in.provider,
        hashed_password=None # No password for social-only users initially
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    request.session["user_id"] = new_user.id
    return new_user

@router.post("/logout")
def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out"}

@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return user

@router.put("/me", response_model=UserResponse)
def update_me(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_update.username:
        # Check if username exists
        existing_user = db.query(User).filter(User.username == user_update.username, User.id != current_user.id).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = user_update.username
        
    if user_update.email:
        existing_user = db.query(User).filter(User.email == user_update.email, User.id != current_user.id).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already taken")
        current_user.email = user_update.email
        
    if user_update.student_id is not None:
        current_user.student_id = user_update.student_id
        
    if user_update.password:
        # If user has a password, verify old one
        if current_user.hashed_password:
            if not user_update.old_password:
                raise HTTPException(status_code=400, detail="Old password is required to set a new password")
            if not verify_password(user_update.old_password, current_user.hashed_password):
                raise HTTPException(status_code=400, detail="Incorrect old password")
        
        if user_update.password != user_update.confirm_password:
            raise HTTPException(status_code=400, detail="New passwords do not match")
            
        current_user.hashed_password = get_password_hash(user_update.password)
        # If they set a password, they are no longer purely social if they choose
        # (keeping provider as is for tracking)
        
    db.commit()
    db.refresh(current_user)
    return current_user

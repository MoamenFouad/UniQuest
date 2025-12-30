from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database import Base

class TaskType(str, enum.Enum):
    LECTURE = "lecture"
    ASSIGNMENT = "assignment"
    PROJECT = "project"
    QUIZ = "quiz"
    LAB = "lab"
    OTHER = "other"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    student_id = Column(String, index=True, nullable=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=True)
    provider = Column(String, default="traditional") # "traditional", "google", "facebook", "apple"
    profile_picture = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    submissions = relationship("Submission", back_populates="user")
    room_memberships = relationship("RoomMember", back_populates="user")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String, nullable=True)
    code = Column(String, unique=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"))
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    admin = relationship("User")
    members = relationship("RoomMember", back_populates="room", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="room", cascade="all, delete-orphan")

class RoomMember(Base):
    __tablename__ = "room_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    is_admin = Column(Boolean, default=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="room_memberships")
    room = relationship("Room", back_populates="members")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"))
    type = Column(String) # "lecture" or "assignment"
    title = Column(String)
    description = Column(String, nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True) # For assignments
    start_time = Column(DateTime(timezone=True), nullable=True) # For lectures
    end_time = Column(DateTime(timezone=True), nullable=True) # For lectures
    xp_value = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    room = relationship("Room", back_populates="tasks")
    submissions = relationship("Submission", back_populates="task", cascade="all, delete-orphan")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    file_path = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    xp_awarded = Column(Integer, default=0)
    status = Column(String, default="pending") # "pending", "verified", "rejected"

    task = relationship("Task", back_populates="submissions")
    user = relationship("User", back_populates="submissions")

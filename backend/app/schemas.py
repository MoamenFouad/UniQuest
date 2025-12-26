from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .models import TaskType

class UserBase(BaseModel):
    username: str
    student_id: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RoomBase(BaseModel):
    name: str

class RoomCreate(RoomBase):
    pass

class RoomResponse(RoomBase):
    id: int
    code: str
    admin_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: TaskType
    xp_value: int

class TaskCreate(TaskBase):
    deadline: Optional[datetime] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: int
    room_id: int
    deadline: Optional[datetime]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    created_at: datetime
    is_submitted: bool = False
    is_expired: bool = False
    completed: bool = False # Frontend compatibility alias

    class Config:
        from_attributes = True

class SubmissionResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    file_path: str
    xp_awarded: int
    timestamp: datetime

    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    user_id: int
    username: str
    total_xp: int
    rank: int

class ActivityEntry(BaseModel):
    quest_title: str
    room_name: str
    xp_earned: int
    timestamp: datetime

class DailyXP(BaseModel):
    date: str
    xp: int

class RoomXP(BaseModel):
    room_id: int
    room_name: str
    room_code: str
    xp: int

class DashboardResponse(BaseModel):
    total_xp: int
    level: int
    current_streak: int
    quests_completed: int
    xp_by_day: List[DailyXP]
    xp_by_room: List[RoomXP]
    recent_activities: List[ActivityEntry]
    top_adventurers: List[LeaderboardEntry]

from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from ..models import Submission, Task

def calculate_daily_xp(user_id: int, db: Session):
    today = date.today()
    submissions = db.query(Submission).filter(
        Submission.user_id == user_id,
        func.date(Submission.timestamp) == today
    ).all()
    
    base_xp = sum(s.xp_awarded for s in submissions)
    count = len(submissions)
    
    multiplier = 1.0
    if count >= 7:
        multiplier = 3.5
    elif count >= 4:
        multiplier = 1.5
        
    return int(base_xp * multiplier)

# Note: The prompt says "Multiplier applies to total daily XP".
# This logic might need to be applied when querying for leaderboards or when awarding XP.
# However, if we store the awarded XP in the submission, we might need to recalculate daily.
# A simpler approach for MVP:
# The prompt says "Streak multipliers: 4 tasks/day -> 1.5x XP".
# This implies that if I do 4 tasks, ALL my XP for today is multiplied.
# So we shouldn't burn the multiplier into the Submission.xp_awarded unless we update all previous submissions for the day.
# Better approach: Submission stores base XP.
# Leaderboard calculation sums base XP * daily_multiplier.

def get_daily_multiplier(submission_count: int) -> float:
    if submission_count >= 7:
        return 3.5
    if submission_count >= 4:
        return 1.5
    return 1.0

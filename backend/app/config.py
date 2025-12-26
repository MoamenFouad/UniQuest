import os

class Settings:
    PROJECT_NAME: str = "UniQuest"
    PROJECT_VERSION: str = "1.0.0"
    DATABASE_URL: str = "sqlite:///./uniquest_v2.db"
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

settings = Settings()

if not os.path.exists(settings.UPLOAD_DIR):
    os.makedirs(settings.UPLOAD_DIR)

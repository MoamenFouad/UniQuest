from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from .routers import auth, rooms, tasks, submissions
from .database import engine, Base
from .config import settings

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME, version=settings.PROJECT_VERSION)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set to specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SessionMiddleware, secret_key="secret-key-replace-me") # Simple session secret

# Routers
app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(tasks.router)
app.include_router(submissions.router)

# Static files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to UniQuest API"}

# Architecture

## Directory Structure
- `backend/`: FastAPI application
- `frontend/`: React + Vite application

## Database
SQLite database `uniquest.db` stored in `backend/`.

## Authentication
Session-based authentication using cookies. No passwords.
User identity is verified via unique username.

## Game Logic
- **XP**: 100 XP per Lecture, 75 XP per Assignment.
- **Streak**: Multipliers based on daily task completion count.

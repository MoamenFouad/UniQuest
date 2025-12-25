# UniQuest

UniQuest is a gamified student life MVP application where university activities are turned into quests.

## Tech Stack
- **Backend**: FastAPI, SQLite, SQLAlchemy
- **Frontend**: React, Vite, TailwindCSS

## Setup
See `docs/architecture.md` for details.

### Quick Start
1. Run `./backend/run.sh` to start the server.
2. In a new terminal, run `./frontend/run.sh` to start the web app.

## Hosting
The app is ready for deployment on platforms like Render or Railway.
- **Backend**: Set host to `0.0.0.0` (default in run.sh).
- **Frontend**: Set `VITE_API_URL` environment variable to your backend URL (e.g. `https://uniquest-api.onrender.com`).

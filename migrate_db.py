import sqlite3
import os

db_path = "backend/uniquest.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE rooms ADD COLUMN description TEXT")
        print("Added description column to rooms")
    except sqlite3.OperationalError:
        print("description column already exists or error")
        
    try:
        cursor.execute("ALTER TABLE tasks ADD COLUMN xp_value INTEGER DEFAULT 0")
        print("Added xp_value column to tasks")
    except sqlite3.OperationalError:
        print("xp_value column already exists or error")

    try:
        cursor.execute("ALTER TABLE submissions ADD COLUMN xp_awarded INTEGER DEFAULT 0")
        print("Added xp_awarded column to submissions")
    except sqlite3.OperationalError:
        print("xp_awarded column already exists or error")

    try:
        cursor.execute("ALTER TABLE submissions ADD COLUMN status TEXT DEFAULT 'pending'")
        print("Added status column to submissions")
    except sqlite3.OperationalError:
        print("status column already exists or error")
    
    conn.commit()
    conn.close()
else:
    print("Database not found")

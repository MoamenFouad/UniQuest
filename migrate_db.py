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
        cursor.execute("ALTER TABLE rooms ADD COLUMN is_public BOOLEAN DEFAULT 1")
        print("Added is_public column to rooms")
    except sqlite3.OperationalError:
        print("is_public column already exists or error")
    
    conn.commit()
    conn.close()
else:
    print("Database not found")

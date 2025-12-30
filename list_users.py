
import sqlite3
import os

db_path = "backend/uniquest.db"
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email FROM users;")
    users = cursor.fetchall()
    print("Users:")
    for user in users:
        print(user)
    conn.close()

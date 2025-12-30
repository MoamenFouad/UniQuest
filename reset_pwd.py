
from passlib.context import CryptContext
import sqlite3

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

hashed = get_password_hash("password123")
conn = sqlite3.connect("backend/uniquest.db")
cursor = conn.cursor()
cursor.execute("UPDATE users SET hashed_password = ? WHERE username = 'nour_atef';", (hashed,))
conn.commit()
print("Password updated for nour_atef to 'password123'")
conn.close()

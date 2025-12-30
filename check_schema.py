
import sqlite3

conn = sqlite3.connect("backend/uniquest.db")
cursor = conn.cursor()

def print_table_info(table_name):
    print(f"\nTable: {table_name}")
    cursor.execute(f"PRAGMA table_info({table_name})")
    for row in cursor.fetchall():
        print(row)

print_table_info("tasks")
print_table_info("submissions")
conn.close()

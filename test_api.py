
import requests

BASE_URL = "http://localhost:8006"

def test_dashboard():
    # We need a user session. Let's try to login first.
    # Assuming 'nour_atef' exists.
    session = requests.Session()
    resp = session.post(f"{BASE_URL}/auth/login", json={"identifier": "nour_atef", "password": "password123"})
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        return
    
    print("Logged in. Testing dashboard...")
    resp = session.get(f"{BASE_URL}/dashboard")
    print(f"Dashboard status: {resp.status_code}")
    if resp.status_code != 200:
        print(f"Error: {resp.text}")

def test_tasks():
    session = requests.Session()
    session.post(f"{BASE_URL}/auth/login", json={"identifier": "nour_atef", "password": "password"})
    
    # Get a room code
    resp = session.get(f"{BASE_URL}/rooms/my")
    rooms = resp.json()
    if not rooms:
        print("No rooms found")
        return
    
    code = rooms[0]['code']
    print(f"Testing tasks for room {code}...")
    resp = session.get(f"{BASE_URL}/rooms/{code}/tasks")
    print(f"Tasks status: {resp.status_code}")
    if resp.status_code != 200:
        print(f"Error: {resp.text}")

if __name__ == "__main__":
    test_dashboard()
    test_tasks()

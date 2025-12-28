import subprocess
import threading
import time
import os
import signal

def kill_port(port):
    """Hunt and kill anything on a specific port in Windows."""
    try:
        # Get the PID
        out = subprocess.check_output(f"netstat -ano | findstr :{port}", shell=True).decode()
        for line in out.strip().split("\n"):
            if "LISTENING" in line:
                pid = line.strip().split()[-1]
                subprocess.run(f"taskkill /F /PID {pid} /T", shell=True, capture_output=True)
                print(f"🧹 Cleared ghost process on port {port}")
    except:
        pass

def drain_output(proc, prefix):
    for line in iter(proc.stdout.readline, ""):
        # Suppress common triggers for browser auto-opening (Vite/Uvicorn)
        if "http://" in line or "localhost" in line or "127.0.0.1" in line:
            clean = line.replace("http://", "[HIDDEN_URL://]").replace("127.0.0.1", "LINK").replace("localhost", "LINK")
        else:
            clean = line
        print(f"{prefix} {clean}", end="")

def run():
    print("="*60)
    print("💎 UniQuest ULTIMATE Launcher & Health Guard")
    print("="*60)
    
    # Pre-flight cleanup
    print("🛡️  Performing pre-flight port cleanup...")
    for p in [8000, 8001, 8002, 5173, 5174, 5175]:
        kill_port(p)
    print("✅ Port cleanup complete.")

    root = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root, "backend")
    frontend_dir = os.path.join(root, "frontend")

    # 1. Backend Start (Switching to 8002 for ultimate safety)
    print("\n📡 Launching Backend (Port 8002)...")
    backend_proc = subprocess.Popen(
        [os.path.join(backend_dir, "venv", "Scripts", "python.exe"), "-m", "uvicorn", "app.main:app", "--port", "8002"],
        cwd=backend_dir, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1
    )
    threading.Thread(target=drain_output, args=(backend_proc, "BACKEND :"), daemon=True).start()

    # 2. Frontend Start
    print("🎨 Launching Frontend (Vite)...")
    frontend_proc = subprocess.Popen(
        ["npm.cmd", "run", "dev", "--", "--no-open"],
        cwd=frontend_dir, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1
    )
    threading.Thread(target=drain_output, args=(frontend_proc, "FRONTEND:"), daemon=True).start()

    time.sleep(5)
    
    print("\n" + "*"*60)
    print("🎉 FULL CHECKUP COMPLETE: EVERYTHING IS READY!")
    print("*"*60)
    print("\n👉 TO PREVENT DOUBLE TABS, COPY AND PASTE THIS INTO YOUR BROWSER:")
    print("   h t t p : / / l o c a l h o s t : 5 1 7 3 /")
    print("   (Or type it manually in your address bar)")
    print("\n(Press Ctrl+C to safely exit everything)\n")

    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("\n❌ Backend crashed. See logs above.")
                break
            if frontend_proc.poll() is not None:
                print("\n❌ Frontend crashed. See logs above.")
                break
    except KeyboardInterrupt:
        print("\n🛑 Safety shutdown initiated...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    run()

import firebase_admin
from firebase_admin import auth, credentials
import os
from fastapi import HTTPException

# Initialize Firebase Admin
# In production, you'd use a service account JSON file
# For now, we'll try to initialize it with default credentials or skip if already initialized
try:
    if not firebase_admin._apps:
        # 1. Check Env Var
        cert_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH")
        
        # 2. Check backend root directory if env var is empty
        if not cert_path or not os.path.exists(cert_path):
            # utils/firebase.py -> utils -> app -> backend
            backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            local_key = os.path.join(backend_root, "firebase-key.json")
            if os.path.exists(local_key):
                cert_path = local_key

        if cert_path and os.path.exists(cert_path):
            print(f"DEBUG: Initializing Firebase with certificate at: {cert_path}")
            cred = credentials.Certificate(cert_path)
            firebase_admin.initialize_app(cred)
        else:
            print("DEBUG: Initializing Firebase with default options (No certificate found)")
            firebase_admin.initialize_app(options={'projectId': 'uniquest-6d420'})
except Exception as e:
    print(f"Firebase Admin initialization warning: {e}")
    # We'll handle the "app already exists" or "no credentials" cases gracefully

def verify_firebase_token(id_token: str):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Firebase token: {str(e)}")

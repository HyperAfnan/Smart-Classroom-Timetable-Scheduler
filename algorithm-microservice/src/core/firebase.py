import os
import firebase_admin
from firebase_admin import credentials, firestore
from src.core.utils import get_logger

log = get_logger(__name__)

def initialize_firebase():
    """
    Initialize Firebase Admin SDK.
    Prefers 'serviceAccountKey.json' if present.
    Otherwise falls back to default Google credentials (useful for cloud/container environments).
    """
    try:
        if not firebase_admin._apps:
            cred_path = os.getenv("FIREBASE_CREDENTIALS", "serviceAccountKey.json")
            
            if os.path.exists(cred_path):
                log.info(f"Initializing Firebase with credentials from {cred_path}")
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
            else:
                log.warning(f"Credentials file not found at {cred_path}. Using Application Default Credentials.")
                # This requires GOOGLE_APPLICATION_CREDENTIALS to be set or running in GCP
                firebase_admin.initialize_app()
                
            log.info("Firebase Admin SDK initialized successfully.")
    except Exception as e:
        log.error(f"Failed to initialize Firebase: {e}")
        # We assume the app cannot function without DB, but letting the caller handle failure is safer.
        pass

# Initialize
initialize_firebase()

# Expose DB client
try:
    db = firestore.client()
except Exception as e:
    log.error(f"Failed to create Firestore client: {e}")
    db = None

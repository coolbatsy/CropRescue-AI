import hashlib
import os
import hmac
import time
import json
import base64

def hash_password(password: str) -> tuple[str, str]:
    salt = os.urandom(16).hex()
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return pwd_hash, salt

def verify_password(password: str, pwd_hash: str, salt: str) -> bool:
    test_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return hmac.compare_digest(pwd_hash, test_hash)

SECRET = "croprescue_ai_secret_key_2026"

def create_access_token(user_id: str, role: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "email": email,
        "exp": int(time.time()) + 7 * 24 * 3600
    }
    raw = json.dumps(payload).encode('utf-8')
    b64 = base64.urlsafe_b64encode(raw).decode('utf-8')
    sig = hmac.new(SECRET.encode('utf-8'), b64.encode('utf-8'), hashlib.sha256).hexdigest()
    return f"{b64}.{sig}"

def verify_access_token(token: str) -> dict | None:
    try:
        parts = token.split('.')
        if len(parts) != 2:
            return None
        b64, sig = parts
        expected_sig = hmac.new(SECRET.encode('utf-8'), b64.encode('utf-8'), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        payload = json.loads(base64.urlsafe_b64decode(b64.encode('utf-8')).decode('utf-8'))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None

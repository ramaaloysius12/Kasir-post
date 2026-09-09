from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os
from functools import wraps
from flask import request, jsonify

# Menggunakan pbkdf2_sha256 yang sangat stabil dan aman di Android/UserLand
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super_secret_key_123")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(hours=12)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

# Ini adalah fungsi yang hilang tadi (Middleware khusus Admin)
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        if not token:
            return jsonify({"message": "Akses ditolak. Token tidak ditemukan."}), 401
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user = payload
        except Exception:
            return jsonify({"message": "Token tidak valid atau kedaluwarsa."}), 401
        return f(*args, **kwargs)
    return decorated

from flask import Blueprint, request, jsonify
from app.core.database import get_db
from app.models.domain import User
from app.core.security import verify_password, create_access_token

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'], strict_slashes=False)
def login():
    data = request.get_json()
    db = next(get_db())
    user = db.query(User).filter(User.email == data.get('email')).first()
    if not user or not verify_password(data.get('password'), user.password_hash):
        return jsonify({"message": "Email/password salah"}), 401
    token = create_access_token(data={"sub": user.email, "id": user.id})
    return jsonify({"access_token": token, "name": user.name})

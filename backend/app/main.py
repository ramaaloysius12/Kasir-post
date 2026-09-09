from flask import Flask, jsonify
from flask_cors import CORS
from app.core.database import Base, engine, get_db
from app.models.domain import Category, Product, User
from app.core.security import get_password_hash
from app.api.auth import auth_bp
from app.api.products import products_bp
from app.api.orders import orders_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(auth_bp)
app.register_blueprint(products_bp)
app.register_blueprint(orders_bp)

def seed_db():
    db = next(get_db())
    if not db.query(User).first():
        db.add(User(name="Admin", email="admin@example.com", password_hash=get_password_hash("admin123")))
    if not db.query(Category).first():
        c1, c2, c3 = Category(name="Coffee"), Category(name="Non Coffee"), Category(name="Snack")
        db.add_all([c1, c2, c3])
        db.flush()
        db.add_all([
            Product(category_id=c1.id, name="Caramel Macchiato", price=45000, stock=20),
            Product(category_id=c2.id, name="Matcha Latte", price=38000, stock=15),
            Product(category_id=c3.id, name="Butter Croissant", price=25000, stock=5)
        ])
    db.commit()

with app.app_context():
    try:
        Base.metadata.create_all(bind=engine)
        seed_db()
        print("✅ Database PostgreSQL terhubung & Seed Data siap!")
    except Exception as e:
        print(f"⚠️ Gagal konek DB (Database Error). Error: {e}")

@app.route("/api/health")
def health(): return jsonify({"status": "ok", "message": "Backend Flask Connected!"})

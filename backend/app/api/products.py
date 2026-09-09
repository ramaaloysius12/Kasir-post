import os
import uuid
from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
from app.core.database import get_db
from app.models.domain import Product, Category
from app.core.security import admin_required

products_bp = Blueprint('products', __name__, url_prefix='/api/products')
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../frontend/public/img'))
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@products_bp.route('/upload', methods=['POST'], strict_slashes=False)
@admin_required
def upload_image():
    if 'image' not in request.files: return jsonify({"error": "Tidak ada file"}), 400
    file = request.files['image']
    if file.filename == '': return jsonify({"error": "Nama kosong"}), 400
    if file and allowed_file(file.filename):
        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_name = f"img_{uuid.uuid4().hex[:10]}.{ext}"
        save_path = os.path.join(UPLOAD_FOLDER, unique_name)
        file.save(save_path)
        return jsonify({"image_url": f"/img/{unique_name}"}), 201
    return jsonify({"error": "Format tidak didukung"}), 400

@products_bp.route('', methods=['GET'], strict_slashes=False)
@products_bp.route('/', methods=['GET'], strict_slashes=False)
def get_products():
    db = next(get_db())
    try:
        products = db.query(Product).order_by(Product.category_id, Product.name).all()
        result = [{"id": p.id, "name": p.name, "category": p.category.name if p.category else "", "category_id": p.category_id, "price": float(p.price), "stock": p.stock, "image_url": p.image_url} for p in products]
        return jsonify(result)
    finally:
        db.close()

@products_bp.route('/categories', methods=['GET'], strict_slashes=False)
def get_categories():
    db = next(get_db())
    try:
        categories = db.query(Category).all()
        return jsonify([{"id": c.id, "name": c.name} for c in categories])
    finally:
        db.close()

@products_bp.route('', methods=['POST'], strict_slashes=False)
@products_bp.route('/', methods=['POST'], strict_slashes=False)
@admin_required
def create_product():
    data = request.get_json() or {}
    db = next(get_db())
    try:
        new_product = Product(name=data['name'], price=data['price'], stock=data.get('stock', 0), category_id=data.get('category_id'), image_url=data.get('image_url', ''))
        db.add(new_product)
        db.commit()
        return jsonify({"message": "Produk berhasil ditambahkan"}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()

@products_bp.route('/<int:id>', methods=['PUT'], strict_slashes=False)
@admin_required
def update_product(id):
    data = request.get_json() or {}
    db = next(get_db())
    try:
        product = db.query(Product).filter(Product.id == id).first()
        if not product: return jsonify({"error": "Produk tidak ditemukan"}), 404
        product.name = data.get('name', product.name)
        product.price = data.get('price', product.price)
        product.stock = data.get('stock', product.stock)
        product.category_id = data.get('category_id', product.category_id)
        product.image_url = data.get('image_url', product.image_url)
        db.commit()
        return jsonify({"message": "Produk diupdate"})
    finally:
        db.close()

@products_bp.route('/<int:id>', methods=['DELETE'], strict_slashes=False)
@admin_required
def delete_product(id):
    db = next(get_db())
    try:
        product = db.query(Product).filter(Product.id == id).first()
        if not product: return jsonify({"error": "Produk tidak ditemukan"}), 404
        db.delete(product)
        db.commit()
        return jsonify({"message": "Produk dihapus"})
    finally:
        db.close()

import os
from dotenv import load_dotenv
from flask import Blueprint, request, jsonify
from app.core.database import get_db, Base
from app.models.domain import Order, OrderItem, Product, OrderStatus
from app.core.security import admin_required
from datetime import datetime
import random
from sqlalchemy import Column, Integer, String, Float, Boolean
import midtransclient

# Muat file .env secara otomatis
load_dotenv()

# ================= KONFIGURASI MIDTRANS =================
# Mengambil dari file .env (Sangat Aman)
MIDTRANS_SERVER_KEY = os.getenv('MIDTRANS_SERVER_KEY')
MIDTRANS_CLIENT_KEY = 'Mid-client-NEghVTUVMAFbb-96'

snap = midtransclient.Snap(
    is_production=False,
    server_key=MIDTRANS_SERVER_KEY,
    client_key=MIDTRANS_CLIENT_KEY
)
# =========================================================

class Voucher(Base):
    __tablename__ = 'vouchers'
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True)
    code = Column(String(50), unique=True, nullable=False)
    discount_type = Column(String(20), nullable=False, default='percent')
    discount_value = Column(Float, nullable=False)
    min_purchase = Column(Float, default=0)
    is_active = Column(Boolean, default=True)

class OrderDiscount(Base):
    __tablename__ = 'order_discounts'
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, nullable=False)
    voucher_code = Column(String(50))
    discount_amount = Column(Float)

orders_bp = Blueprint('orders', __name__, url_prefix='/api/orders')

def ensure_tables():
    try:
        db = next(get_db())
        engine = db.get_bind()
        Voucher.__table__.create(engine, checkfirst=True)
        OrderDiscount.__table__.create(engine, checkfirst=True)
        db.close()
    except Exception:
        pass

def gen_order_num():
    return f"ORD-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"

@orders_bp.route('/vouchers', methods=['GET'], strict_slashes=False)
@admin_required
def get_vouchers():
    ensure_tables()
    db = next(get_db())
    try:
        vouchers = db.query(Voucher).all()
        return jsonify([{"id": v.id, "code": v.code, "discount_type": v.discount_type, "discount_value": v.discount_value, "min_purchase": v.min_purchase, "is_active": v.is_active} for v in vouchers])
    finally: db.close()

@orders_bp.route('/vouchers', methods=['POST'], strict_slashes=False)
@admin_required
def create_voucher():
    ensure_tables()
    data = request.get_json() or {}
    db = next(get_db())
    try:
        v = Voucher(code=data['code'], discount_type=data['discount_type'], discount_value=float(data['discount_value']), min_purchase=float(data.get('min_purchase', 0)), is_active=True)
        db.add(v)
        db.commit()
        return jsonify({"message": "Voucher berhasil dibuat"})
    except Exception:
        db.rollback()
        return jsonify({"error": "Kode voucher sudah ada"}), 400
    finally: db.close()

@orders_bp.route('/vouchers/<int:id>', methods=['DELETE'], strict_slashes=False)
@admin_required
def delete_voucher(id):
    db = next(get_db())
    try:
        v = db.query(Voucher).filter(Voucher.id == id).first()
        if v:
            db.delete(v)
            db.commit()
            return jsonify({"message": "Voucher dihapus"})
        return jsonify({"error": "Tidak ditemukan"}), 404
    finally: db.close()

@orders_bp.route('/vouchers/validate', methods=['POST'], strict_slashes=False)
def validate_voucher():
    ensure_tables()
    data = request.get_json() or {}
    code = data.get('code', '').upper()
    subtotal = float(data.get('subtotal', 0))
    db = next(get_db())
    try:
        v = db.query(Voucher).filter(Voucher.code == code, Voucher.is_active == True).first()
        if not v: return jsonify({"error": "Voucher tidak valid!"}), 400
        if subtotal < v.min_purchase: return jsonify({"error": f"Minimal belanja Rp {v.min_purchase:,.0f}"}), 400
        return jsonify({"code": v.code, "discount_type": v.discount_type, "discount_value": v.discount_value})
    finally: db.close()

@orders_bp.route('', methods=['POST'], strict_slashes=False)
@orders_bp.route('/', methods=['POST'], strict_slashes=False)
def create_order():
    ensure_tables()
    data = request.get_json() or {}
    db = next(get_db())
    try:
        subtotal = 0
        items_data = []
        for item in data.get('items', []):
            product = db.query(Product).filter(Product.id == item['id']).first()
            if not product or product.stock < item['quantity']: raise ValueError(f"Stock {product.name if product else 'Produk'} habis")
            product.stock -= item['quantity']
            item_sub = float(product.price) * item['quantity']
            subtotal += item_sub
            items_data.append(OrderItem(product_id=product.id, product_name_snapshot=product.name, price_snapshot=product.price, quantity=item['quantity'], subtotal=item_sub, notes=item.get('notes', '')))
        
        discount = 0
        voucher_code = data.get('voucher_code')
        if voucher_code:
            v = db.query(Voucher).filter(Voucher.code == voucher_code).first()
            if v and subtotal >= v.min_purchase:
                discount = subtotal * (v.discount_value / 100) if v.discount_type == 'percent' else v.discount_value
        
        total = max(0, subtotal - discount)
        new_order = Order(order_number=gen_order_num(), customer_name=data['customer_name'], table_number=data['table_number'], subtotal=subtotal, total=total, payment_method=data['payment_method'])
        db.add(new_order)
        db.flush()
        for oi in items_data:
            oi.order_id = new_order.id
            db.add(oi)
        if discount > 0:
            db.add(OrderDiscount(order_id=new_order.id, voucher_code=voucher_code, discount_amount=discount))

        # INTEGRASI MIDTRANS
        snap_token = None
        if data.get('payment_method') == 'MIDTRANS':
            if not MIDTRANS_SERVER_KEY:
                raise ValueError("Midtrans Server Key belum diatur di .env")
            param = {
                "transaction_details": {
                    "order_id": new_order.order_number,
                    "gross_amount": int(total)
                },
                "customer_details": {
                    "first_name": new_order.customer_name,
                    "notes": f"Meja {new_order.table_number}"
                }
            }
            transaction = snap.create_transaction(param)
            snap_token = transaction['token']

        db.commit()
        return jsonify({"message": "OK", "order_id": new_order.order_number, "snap_token": snap_token}), 201
    except ValueError as e:
        db.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.rollback()
        return jsonify({"error": "Sistem Error"}), 500
    finally: db.close()

@orders_bp.route('/midtrans-webhook', methods=['POST'], strict_slashes=False)
def midtrans_webhook():
    data = request.get_json() or {}
    order_id = data.get('order_id')
    transaction_status = data.get('transaction_status')
    
    db = next(get_db())
    try:
        order = db.query(Order).filter(Order.order_number == order_id).first()
        if order:
            if transaction_status in ['capture', 'settlement']:
                order.order_status = OrderStatus.PAID
            elif transaction_status in ['cancel', 'deny', 'expire']:
                pass
            db.commit()
        return jsonify({"status": "ok"})
    finally: db.close()

@orders_bp.route('', methods=['GET'], strict_slashes=False)
@orders_bp.route('/', methods=['GET'], strict_slashes=False)
@admin_required
def get_all_orders():
    ensure_tables()
    db = next(get_db())
    try:
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
        result = []
        for o in orders:
            items = [{"name": i.product_name_snapshot, "qty": i.quantity, "notes": i.notes} for i in o.items]
            od = db.query(OrderDiscount).filter(OrderDiscount.order_id == o.id).first()
            result.append({
                "id": o.id, "order_number": o.order_number, "customer_name": o.customer_name, "table_number": o.table_number, "total": float(o.total), 
                "status": o.order_status.name if hasattr(o.order_status, 'name') else str(o.order_status), "payment_method": o.payment_method, "items": items,
                "discount_info": f"Voucher: {od.voucher_code} (-Rp {od.discount_amount:,.0f})" if od else None, "created_at": o.created_at.isoformat() if o.created_at else None
            })
        return jsonify(result)
    finally: db.close()

@orders_bp.route('/<int:order_id>/status', methods=['PATCH'], strict_slashes=False)
@admin_required
def update_order_status(order_id):
    data = request.get_json() or {}
    db = next(get_db())
    try:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order: return jsonify({"error": "Pesanan tidak ditemukan"}), 404
        order.order_status = OrderStatus[data.get('status')]
        db.commit()
        return jsonify({"message": "Status berhasil diupdate"})
    except KeyError: return jsonify({"error": "Status tidak valid"}), 400
    finally: db.close()

@orders_bp.route('/track/<string:order_number>', methods=['GET'], strict_slashes=False)
def track_order(order_number):
    ensure_tables()
    db = next(get_db())
    try:
        order = db.query(Order).filter(Order.order_number == order_number).first()
        if not order: return jsonify({"error": "Pesanan tidak ditemukan"}), 404
        status_str = order.order_status.name if hasattr(order.order_status, 'name') else str(order.order_status)
        return jsonify({"order_number": order.order_number, "customer_name": order.customer_name, "table_number": order.table_number, "status": status_str, "total": float(order.total)})
    finally: db.close()

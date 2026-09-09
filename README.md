# ☕ RamaPOS - Sistem Kasir Pintar (Coffee POS)

RamaPOS adalah sistem Point of Sale (POS) modern, responsif, dan berkinerja tinggi yang dirancang khusus untuk kedai kopi, kafe, dan restoran. Menggunakan pemisahan arsitektur *Frontend* dan *Backend* untuk memastikan performa yang cepat dan pengalaman pengguna (UI/UX) sekelas aplikasi *native*.

**Dikembangkan oleh:** Rama DevOps Company

---

## ✨ Fitur Utama
- **Mobile-First UI:** Tampilan responsif yang cantik di layar HP kasir maupun tablet dengan menu model *Bottom Sheet*.
- **Manajemen Keranjang & Voucher:** Sistem diskon dinamis (Persentase & Nominal) dengan validasi minimal belanja secara *real-time*.
- **Payment Gateway Midtrans:** Integrasi pembayaran *online* instan via QRIS, GoPay, OVO, ShopeePay, Virtual Account (BCA, Mandiri), dan Kartu Kredit.
- **Live Order Tracking:** Pelanggan dapat melacak status pesanan tanpa membebani memori server (Optimasi koneksi database).
- **Admin Dashboard:** Kelola menu produk, buat voucher promo, dan update status pesanan dengan UI *dashboard* yang bersih.
- **Secure Architecture:** Dilengkapi perlindungan *Secret Key* via file `.env` dan kebal dari *Timeout QueuePool Database*.

---

## 🛠️ Tech Stack
- **Frontend:** Next.js (React), Tailwind CSS, Zustand (State Management), Lucide Icons
- **Backend:** Python Flask, SQLAlchemy (ORM), Waitress (WSGI Server)
- **Database:** SQLite (`coffeepos.db` - Ringan & Portabel)
- **Third-Party:** Midtrans Payment Gateway Snap API

---

## 💻 Panduan Instalasi (Development Mode)

### 1. Persiapan Backend (Flask API)
Masuk ke direktori backend dan instal dependensi yang dibutuhkan:
```bash
cd backend
pip install flask flask-cors sqlalchemy midtransclient python-dotenv

## 2.menjalankan frontend 

cd frontend
npm install
npm rundev


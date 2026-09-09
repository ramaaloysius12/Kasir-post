'use client';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { ArrowLeft, CheckCircle2, Wallet, QrCode, ChevronRight, Ticket, ReceiptText } from 'lucide-react';

declare global { interface Window { snap: any; } }

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getTotal, updateNotes, clearCart, voucher, setVoucher } = useCartStore();
  
  const [name, setName] = useState('');
  const [table, setTable] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MIDTRANS'); // Default ke Online
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  const [voucherMsg, setVoucherMsg] = useState('');

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg border border-gray-100"><Wallet className="w-10 h-10 text-gray-300" /></div>
        <h2 className="text-2xl font-black text-stone-900 mb-2">Keranjang Kosong</h2>
        <button onClick={() => router.push('/')} className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold mt-4 shadow-xl active:scale-95 transition-all">Lihat Menu</button>
      </div>
    );
  }

  const applyVoucher = async () => {
    if(!voucherCode) return;
    setCheckingVoucher(true); setVoucherMsg('');
    try {
      const res = await fetch('http://localhost:8000/api/orders/vouchers/validate', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ code: voucherCode, subtotal: getSubtotal() })
      });
      const data = await res.json();
      if(res.ok) { setVoucher(data); setVoucherMsg(`Diskon berhasil diterapkan 🎉`); } 
      else { setVoucherMsg(data.error); setVoucher(null); }
    } catch { setVoucherMsg('Gagal memvalidasi voucher.'); }
    setCheckingVoucher(false);
  };

  const handleCheckout = async () => {
    if (!name || !table) return alert('Silakan isi Nama dan Nomor Meja!');
    setIsSubmitting(true);
    
    try {
      const res = await fetch('http://localhost:8000/api/orders/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name, table_number: table, payment_method: paymentMethod,
          voucher_code: voucher ? voucher.code : null,
          items: items.map(i => ({ id: i.id, quantity: i.quantity, notes: i.notes }))
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        if (data.snap_token) {
          // PANGGIL POP-UP MIDTRANS
          window.snap.pay(data.snap_token, {
            onSuccess: function(result: any){ clearCart(); router.push(`/order/${data.order_id}`); },
            onPending: function(result: any){ clearCart(); router.push(`/order/${data.order_id}`); },
            onError: function(result: any){ alert("Pembayaran gagal!"); setIsSubmitting(false); },
            onClose: function(){ alert('Anda menutup pop-up sebelum menyelesaikan pembayaran.'); setIsSubmitting(false); }
          });
        } else {
          clearCart(); router.push(`/order/${data.order_id}`);
        }
      } else { alert(data.error); setIsSubmitting(false); }
    } catch (err) { alert('Gagal menghubungi server.'); setIsSubmitting(false); }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-36 text-stone-900 font-sans">
      {/* SCRIPT MIDTRANS (GANTI CLIENT KEY DI BAWAH INI) */}
      <Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="Mid-client-NEghVTUVMAFbb-96" strategy="lazyOnload" />

      <div className="bg-white px-5 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
        <button onClick={() => router.back()} type="button" className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95"><ArrowLeft className="w-5 h-5 text-stone-900" /></button>
        <h1 className="text-xl font-black text-stone-900">Checkout</h1>
      </div>

      <div className="p-4 space-y-4 max-w-3xl mx-auto mt-2">
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <h2 className="font-black text-lg mb-5 flex items-center gap-2 border-b border-gray-100 pb-4"><ReceiptText className="w-5 h-5 text-orange-600" /> Informasi Pemesan</h2>
          <div className="space-y-4">
            <div><label className="block text-[11px] font-black text-gray-400 mb-1.5 uppercase ml-1">Nama</label><input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-orange-500 font-bold" /></div>
            <div><label className="block text-[11px] font-black text-gray-400 mb-1.5 uppercase ml-1">No Meja</label><input type="text" value={table} onChange={e=>setTable(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-orange-500 font-bold" /></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <h2 className="font-black text-lg mb-4 flex items-center gap-2 text-stone-900 border-b border-gray-100 pb-4"><Ticket className="w-5 h-5 text-emerald-500" /> Punya Kode Promo?</h2>
          <div className="flex gap-2">
            <input type="text" value={voucherCode} onChange={e=>setVoucherCode(e.target.value.toUpperCase())} disabled={!!voucher} placeholder="Masukkan kode..." className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 font-black uppercase tracking-wider disabled:opacity-50" />
            {!voucher ? (
              <button type="button" onClick={applyVoucher} disabled={checkingVoucher || !voucherCode} className="bg-stone-900 text-white px-6 rounded-xl font-bold hover:bg-stone-800 disabled:opacity-50 active:scale-95 transition-all">{checkingVoucher ? 'Cek...' : 'Pakai'}</button>
            ) : (
              <button type="button" onClick={()=>{setVoucher(null); setVoucherMsg(''); setVoucherCode('');}} className="bg-red-50 text-red-600 px-6 rounded-xl font-bold hover:bg-red-100 active:scale-95 transition-all">Batal</button>
            )}
          </div>
          {voucherMsg && <p className={`text-xs font-bold mt-3 ml-1 ${voucher ? 'text-emerald-600' : 'text-red-500'}`}>{voucherMsg}</p>}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <h2 className="font-black text-lg mb-5 text-stone-900 border-b border-gray-100 pb-4">Metode Pembayaran</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'MIDTRANS', name: 'Bayar Online', icon: QrCode, desc: 'QRIS, GoPay, VA, BCA' },
              { id: 'TUNAI', name: 'Tunai Kasir', icon: Wallet, desc: 'Bayar Langsung' }
            ].map((method) => (
              <button key={method.id} type="button" onClick={() => setPaymentMethod(method.id)} className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all w-full active:scale-95 ${paymentMethod === method.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                {paymentMethod === method.id && <div className="absolute top-2 right-2 text-orange-600"><CheckCircle2 className="w-5 h-5 fill-orange-200" /></div>}
                <method.icon className={`w-8 h-8 mb-2 ${paymentMethod === method.id ? 'text-orange-600' : 'text-gray-400'}`} />
                <span className={`font-black text-sm mb-1 ${paymentMethod === method.id ? 'text-orange-700' : 'text-stone-900'}`}>{method.name}</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest text-center ${paymentMethod === method.id ? 'text-orange-500' : 'text-gray-400'}`}>{method.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-6 shadow-[0_-15px_30px_-10px_rgba(0,0,0,0.1)] z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase text-gray-500 mb-0.5">Total Bayar</p>
            <div className="flex flex-col">
              {voucher && <span className="text-xs font-bold text-gray-400 line-through">Rp {getSubtotal().toLocaleString('id-ID')}</span>}
              <p className="font-black text-2xl text-stone-900">Rp {getTotal().toLocaleString('id-ID')}</p>
            </div>
          </div>
          <button type="button" onClick={handleCheckout} disabled={isSubmitting} className="flex-1 bg-emerald-600 text-white font-black py-4 px-4 rounded-2xl shadow-xl hover:bg-emerald-700 disabled:opacity-70 flex justify-center gap-2 active:scale-95">
            {isSubmitting ? 'MEMPROSES...' : <>BAYAR SEKARANG <ChevronRight className="w-5 h-5" /></>}
          </button>
        </div>
      </div>
    </main>
  );
}

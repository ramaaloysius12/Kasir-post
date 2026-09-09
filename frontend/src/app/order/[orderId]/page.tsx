'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Receipt, ArrowLeft, Clock, CreditCard, ChefHat, CheckCircle2, Loader2, PartyPopper } from 'lucide-react';

export default function OrderTrackingPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Auto-Polling: Cek status setiap 3 detik ke backend
  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/orders/track/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (e) {
        console.error("Gagal mengambil data tracking");
      } finally {
        setLoading(false);
      }
    };

    // Panggil pertama kali
    fetchOrderStatus();
    
    // Jalankan interval setiap 3 detik
    const intervalId = setInterval(fetchOrderStatus, 3000);
    return () => clearInterval(intervalId); // Bersihkan interval jika pindah halaman
  }, [orderId]);

  // Logika Pemetaan Status
  const statuses = ['PENDING_PAYMENT', 'PAID', 'PREPARING', 'COMPLETED'];
  const currentStatusIndex = order ? statuses.indexOf(order.status) : 0;

  const trackingSteps = [
    { title: 'Menunggu Pembayaran', desc: 'Silakan selesaikan pembayaran di kasir', icon: Clock },
    { title: 'Pembayaran Diterima', desc: 'Pesanan Anda sudah masuk antrean', icon: CreditCard },
    { title: 'Sedang Disiapkan', desc: 'Barista sedang meracik pesanan Anda', icon: ChefHat },
    { title: 'Pesanan Selesai!', desc: 'Pesanan siap diantar ke meja Anda', icon: CheckCircle2 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="font-bold text-gray-500">Mencari pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h1 className="text-2xl font-black text-stone-900 mb-2">Pesanan Tidak Ditemukan</h1>
        <button onClick={() => router.push('/')} className="mt-6 bg-stone-900 text-white px-6 py-3 rounded-xl font-bold">Kembali</button>
      </div>
    );
  }

  const isCompleted = order.status === 'COMPLETED';

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center pt-8 p-4 font-sans pb-24">
      <div className="w-full max-w-md">
        
        {/* Header Struk */}
        <div className="bg-white rounded-t-[2rem] p-8 shadow-sm border-b-2 border-dashed border-gray-200 text-center relative overflow-hidden">
          {isCompleted && <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500"></div>}
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            {isCompleted ? <PartyPopper className="w-8 h-8 text-emerald-500" /> : <Receipt className="w-8 h-8 text-orange-600" />}
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ID Pesanan</p>
          <h1 className="text-2xl font-black text-stone-900 tracking-widest">{order.order_number}</h1>
          <div className="mt-4 inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
            <span className="font-bold text-sm text-stone-700">{order.customer_name}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <span className="font-bold text-sm text-orange-600">Meja {order.table_number}</span>
          </div>
        </div>

        {/* Live Tracking Timeline */}
        <div className="bg-white rounded-b-[2rem] p-8 shadow-xl border-t-0">
          <h2 className="font-black text-lg text-stone-900 mb-6 flex items-center gap-2">
            Status Pesanan 
            {currentStatusIndex < 3 && <span className="flex h-2.5 w-2.5 relative ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
            </span>}
          </h2>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            
            {trackingSteps.map((step, index) => {
              const isPassed = index < currentStatusIndex;
              const isActive = index === currentStatusIndex;
              
              return (
                <div key={index} className="relative flex items-start gap-4">
                  {/* Lingkaran Ikon */}
                  <div className={`relative z-10 w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center shadow-sm transition-all duration-500 ${
                    isActive ? 'bg-orange-500 text-white scale-110 shadow-orange-500/30' : 
                    isPassed ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-300'
                  }`}>
                    <step.icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                  </div>
                  
                  {/* Teks Status */}
                  <div className={`pt-1.5 transition-all duration-500 ${isActive ? 'opacity-100' : isPassed ? 'opacity-70' : 'opacity-40'}`}>
                    <h3 className={`font-black text-base ${isActive ? 'text-orange-600' : isPassed ? 'text-stone-900' : 'text-gray-400'}`}>
                      {step.title}
                    </h3>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5 leading-snug">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tombol Aksi */}
        <button onClick={() => router.push('/')} className="w-full mt-6 bg-stone-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-stone-800 active:scale-95 transition-all flex items-center justify-center gap-2">
          <ArrowLeft className="w-5 h-5" /> KEMBALI KE MENU UTAMA
        </button>

      </div>
    </main>
  );
}

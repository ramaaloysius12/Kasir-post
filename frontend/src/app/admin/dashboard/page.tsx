'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, ShoppingBag, Clock, ArrowUpRight } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    fetch('http://localhost:8000/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) { router.push('/admin/login'); return; }
      return res.json();
    })
    .then(data => {
      if (data && Array.isArray(data)) {
        const revenue = data.reduce((acc, order) => acc + order.total, 0);
        const pending = data.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
        setStats({ totalOrders: data.length, totalRevenue: revenue, pending });
      }
      setLoading(false);
    });
  }, [router]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8 md:mt-8">
        <div>
          <h1 className="text-3xl font-black md:text-white text-stone-900 tracking-tight">Ringkasan Hari Ini</h1>
          <p className="md:text-stone-300 text-gray-500 font-medium mt-1">Pantau performa penjualan kedai Anda.</p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 h-32 bg-gray-200 rounded-3xl"></div>
          <div className="flex-1 h-32 bg-gray-200 rounded-3xl"></div>
          <div className="flex-1 h-32 bg-gray-200 rounded-3xl"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card Pendapatan */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden text-white border border-stone-700">
            <Wallet className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white/10 rounded-xl"><Wallet className="w-5 h-5 text-green-400" /></div>
                <h3 className="text-stone-300 font-semibold text-sm">Total Pendapatan</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-stone-400">Rp</span>
                <p className="text-4xl font-black tracking-tight">{stats.totalRevenue.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          {/* Card Total Pesanan */}
          <div className="bg-white p-6 rounded-[2rem] shadow-lg relative overflow-hidden border border-gray-100 group hover:shadow-xl transition-shadow">
            <ShoppingBag className="absolute -bottom-4 -right-4 w-32 h-32 text-gray-50 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-orange-100 rounded-xl"><ShoppingBag className="w-5 h-5 text-orange-600" /></div>
                <h3 className="text-gray-500 font-semibold text-sm">Pesanan Selesai</h3>
              </div>
              <p className="text-4xl font-black text-stone-900 tracking-tight">{stats.totalOrders} <span className="text-lg font-bold text-gray-400">order</span></p>
            </div>
          </div>

          {/* Card Pesanan Aktif */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-[2rem] shadow-xl shadow-orange-500/20 relative overflow-hidden text-white">
            <Clock className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-black/10 rounded-xl"><Clock className="w-5 h-5 text-white" /></div>
                  <h3 className="text-orange-100 font-semibold text-sm">Perlu Diproses</h3>
                </div>
                {stats.pending > 0 && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                )}
              </div>
              <p className="text-4xl font-black tracking-tight">{stats.pending} <span className="text-lg font-bold text-orange-200">antrean</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { Search, Clock, CheckCircle, ChefHat, CreditCard } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = () => {
    const token = localStorage.getItem('admin_token');
    fetch('http://localhost:8000/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => { setOrders(data); setLoading(false); });
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('admin_token');
    await fetch(`http://localhost:8000/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchOrders();
  };

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING_PAYMENT': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'PAID': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PREPARING': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'PENDING_PAYMENT': return <Clock className="w-4 h-4 mr-1.5" />;
      case 'PAID': return <CreditCard className="w-4 h-4 mr-1.5" />;
      case 'PREPARING': return <ChefHat className="w-4 h-4 mr-1.5" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 mr-1.5" />;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mt-8 gap-4">
        <div>
          <h1 className="text-3xl font-black md:text-white text-stone-900 tracking-tight">Manajemen Pesanan</h1>
          <p className="md:text-stone-300 text-gray-500 font-medium mt-1">Kelola dan update status pesanan pelanggan.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-3 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Cari ID atau Nama..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-orange-500 border border-gray-200 shadow-sm font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">ID Pesanan</th>
                <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Pelanggan</th>
                <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Rincian Item</th>
                <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Total Transaksi</th>
                <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Status Pesanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center font-semibold text-gray-400">Memuat data pesanan...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center font-semibold text-gray-400">Belum ada pesanan ditemukan.</td></tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 font-mono text-sm font-bold text-stone-700">
                      {order.order_number}
                    </td>
                    <td className="p-5">
                      <p className="font-black text-stone-900">{order.customer_name}</p>
                      <p className="text-xs font-semibold text-orange-600 bg-orange-50 inline-block px-2 py-0.5 rounded-md mt-1 border border-orange-100">
                        Meja {order.table_number}
                      </p>
                    </td>
                    <td className="p-5 text-sm text-stone-600">
                      <ul className="space-y-1">
                        {order.items.map((i:any, idx:number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="font-black text-stone-900">{i.qty}x</span> 
                            <span className="font-medium">{i.name}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-5">
                      <p className="font-black text-stone-900 text-lg">Rp {order.total.toLocaleString('id-ID')}</p>
                      <p className="text-xs font-medium text-gray-400 mt-0.5">{order.payment_method}</p>
                    </td>
                    <td className="p-5">
                      <div className="relative group">
                        <select 
                          className={`appearance-none cursor-pointer border text-xs font-bold rounded-xl px-3.5 py-2 outline-none w-full flex items-center shadow-sm transition-all ${getStatusColor(order.status)}`}
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                        >
                          <option value="PENDING_PAYMENT">🕒 PENDING</option>
                          <option value="PAID">💳 DIBAYAR</option>
                          <option value="PREPARING">👨‍🍳 DIPROSES</option>
                          <option value="COMPLETED">✅ SELESAI</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

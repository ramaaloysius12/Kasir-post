'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Ticket, X } from 'lucide-react';

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', discount_type: 'percent', discount_value: '', min_purchase: '0', is_active: true });

  const fetchVouchers = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch('http://localhost:8000/api/orders/vouchers', { headers: { 'Authorization': `Bearer ${token}` } });
      setVouchers(await res.json());
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };
  
  useEffect(() => { fetchVouchers(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    await fetch('http://localhost:8000/api/orders/vouchers', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    setIsModalOpen(false); 
    setFormData({ code: '', discount_type: 'percent', discount_value: '', min_purchase: '0', is_active: true });
    fetchVouchers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus voucher ini?')) return;
    const token = localStorage.getItem('admin_token');
    await fetch(`http://localhost:8000/api/orders/vouchers/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchVouchers();
  };

  return (
    <div className="w-full max-w-6xl mx-auto md:px-0 px-2 pb-24 md:pb-0">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mt-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black md:text-white text-stone-900 tracking-tight">Voucher Diskon</h1>
          <p className="hidden md:block text-stone-300 font-medium mt-1">Buat kode promo menarik untuk pelanggan Anda.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-orange-500 text-white px-5 py-3 md:py-2.5 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-orange-600 shadow-sm active:scale-95 transition-all">
          <Plus className="w-5 h-5" /> Buat Voucher Baru
        </button>
      </div>

      {/* ================= TAMPILAN MOBILE (KARTU) ================= */}
      <div className="md:hidden flex flex-col gap-3">
        {loading ? <p className="text-center font-bold text-gray-400 py-10">Memuat voucher...</p> : vouchers.length === 0 ? <p className="text-center font-bold text-gray-400 py-10">Belum ada voucher dibuat.</p> :
          vouchers.map(v => (
            <div key={v.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
              {/* Hiasan Potongan Kertas Tiket */}
              <div className="absolute -left-2 top-1/2 w-4 h-4 bg-gray-50 rounded-full -translate-y-1/2 border-r border-gray-100"></div>
              <div className="absolute -right-2 top-1/2 w-4 h-4 bg-gray-50 rounded-full -translate-y-1/2 border-l border-gray-100"></div>
              
              <div className="flex justify-between items-center pl-3 pr-2 border-b border-gray-50 pb-3 mb-3 border-dashed">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-orange-500" />
                  <h3 className="font-black text-stone-900 text-lg uppercase tracking-widest">{v.code}</h3>
                </div>
                <button onClick={() => handleDelete(v.id)} className="p-2 bg-red-50 text-red-600 rounded-lg active:bg-red-100"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="pl-3 pr-2 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Nilai Diskon</p>
                  <p className="font-black text-emerald-600 text-base">{v.discount_type === 'percent' ? `${v.discount_value}% Diskon` : `Rp ${v.discount_value.toLocaleString('id-ID')} Potongan`}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Min. Belanja</p>
                  <p className="font-bold text-stone-700 text-sm">Rp {v.min_purchase.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {/* ================= TAMPILAN DESKTOP (TABEL) ================= */}
      <div className="hidden md:block bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Kode Voucher</th>
              <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Nilai Diskon</th>
              <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Min. Belanja</th>
              <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vouchers.length === 0 ? <tr><td colSpan={4} className="text-center py-10 font-bold text-gray-400">Belum ada voucher</td></tr> : 
              vouchers.map(v => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-orange-500"/>
                      <span className="font-black text-stone-900 text-lg uppercase tracking-widest">{v.code}</span>
                    </div>
                  </td>
                  <td className="p-5 font-bold text-emerald-600">
                    {v.discount_type === 'percent' ? `${v.discount_value}% Diskon` : `Rp ${v.discount_value.toLocaleString('id-ID')} Potongan`}
                  </td>
                  <td className="p-5 font-bold text-stone-700">Rp {v.min_purchase.toLocaleString('id-ID')}</td>
                  <td className="p-5 text-right">
                    <button onClick={() => handleDelete(v.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* ================= MODAL BOTTOM SHEET (RESPONSIF) ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 md:p-4 p-0">
          <div className="bg-white w-full max-w-md md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 md:zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-lg text-stone-900">Buat Voucher Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-stone-900 bg-gray-100 rounded-full active:scale-95"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Kode Voucher</label>
                <input type="text" required value={formData.code} onChange={e=>setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 uppercase font-black tracking-widest text-orange-600 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Contoh: HEMAT50" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Tipe Diskon</label>
                  <select value={formData.discount_type} onChange={e=>setFormData({...formData, discount_type: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-stone-700 focus:ring-2 focus:ring-orange-500 outline-none">
                    <option value="percent">Persen (%)</option>
                    <option value="fixed">Nominal (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Nilai Diskon</label>
                  <input type="number" required value={formData.discount_value} onChange={e=>setFormData({...formData, discount_value: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-orange-500 outline-none" placeholder="10 / 5000" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Minimal Belanja (Rp)</label>
                <input type="number" required value={formData.min_purchase} onChange={e=>setFormData({...formData, min_purchase: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-orange-500 outline-none" placeholder="0" />
              </div>
              
              <div className="pt-2 pb-2">
                <button type="submit" className="w-full bg-stone-900 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all">
                  SIMPAN VOUCHER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

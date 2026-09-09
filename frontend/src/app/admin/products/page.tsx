'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, X, UploadCloud, Loader2 } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', category_id: 1, image_url: '' });
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('http://localhost:8000/api/products/'),
        fetch('http://localhost:8000/api/products/categories')
      ]);
      setProducts(await prodRes.json());
      setCategories(await catRes.json());
      setLoading(false);
    } catch (e) { console.error(e); setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (prod: any = null) => {
    if (prod) {
      setEditingId(prod.id);
      setFormData({ name: prod.name, price: prod.price, stock: prod.stock, category_id: prod.category_id, image_url: prod.image_url || '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', price: '', stock: '', category_id: categories.length > 0 ? categories[0].id : 1, image_url: '' });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const token = localStorage.getItem('admin_token');
    const uploadData = new FormData(); uploadData.append('image', file);
    try {
      const res = await fetch('http://localhost:8000/api/products/upload', {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: uploadData
      });
      const data = await res.json();
      if (res.ok) setFormData(prev => ({ ...prev, image_url: data.image_url }));
      else alert(data.error || 'Gagal mengunggah foto');
    } catch (err) { alert('Gagal menghubungi server untuk upload'); }
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const url = editingId ? `http://localhost:8000/api/products/${editingId}` : 'http://localhost:8000/api/products/';
    await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    setIsModalOpen(false); fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus produk ini?')) return;
    const token = localStorage.getItem('admin_token');
    await fetch(`http://localhost:8000/api/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
    fetchData();
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const defaultImage = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80";

  return (
    <div className="w-full max-w-6xl mx-auto md:px-0 px-2 pb-24 md:pb-0">
      
      {/* HEADER UTAMA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mt-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black md:text-white text-stone-900 tracking-tight">Manajemen Menu</h1>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Cari menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-orange-500 border border-gray-200 shadow-sm font-medium" />
          </div>
          <button onClick={() => handleOpenModal()} className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 hover:bg-orange-600 shadow-sm active:scale-95 whitespace-nowrap text-sm">
            <Plus className="w-5 h-5" /> <span className="hidden md:inline">Tambah Baru</span>
          </button>
        </div>
      </div>

      {/* ================= TAMPILAN MOBILE (LIST) ================= */}
      <div className="md:hidden flex flex-col gap-3">
        {loading ? <p className="text-center text-gray-500 font-bold py-10">Memuat data...</p> : 
          filteredProducts.map(prod => (
            <div key={prod.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={prod.image_url || defaultImage} className="w-full h-full object-cover" alt="foto" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-stone-900 text-sm leading-tight line-clamp-1">{prod.name}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{prod.category}</p>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="font-black text-orange-600 text-sm mb-0.5">Rp {prod.price.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] font-bold text-stone-500">Stok: {prod.stock}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(prod)} className="p-2 bg-blue-50 text-blue-600 rounded-lg active:bg-blue-100"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(prod.id)} className="p-2 bg-red-50 text-red-600 rounded-lg active:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {/* ================= TAMPILAN DESKTOP (TABEL) ================= */}
      <div className="hidden md:block bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-5 font-bold text-gray-500 uppercase text-xs w-20">Foto</th>
              <th className="p-5 font-bold text-gray-500 uppercase text-xs">Nama & Kategori</th>
              <th className="p-5 font-bold text-gray-500 uppercase text-xs">Harga</th>
              <th className="p-5 font-bold text-gray-500 uppercase text-xs">Stok</th>
              <th className="p-5 font-bold text-gray-500 uppercase text-xs text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map(prod => (
              <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-5"><img src={prod.image_url || defaultImage} className="w-14 h-14 rounded-xl object-cover" alt="foto" /></td>
                <td className="p-5"><p className="font-black text-stone-900">{prod.name}</p><p className="text-xs font-bold text-gray-500 mt-1 uppercase">{prod.category}</p></td>
                <td className="p-5 font-black text-orange-600">Rp {prod.price.toLocaleString('id-ID')}</td>
                <td className="p-5 font-bold text-stone-700">{prod.stock}</td>
                <td className="p-5 text-right">
                  <button onClick={() => handleOpenModal(prod)} className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-2"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(prod.id)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL BOTTOM SHEET (RESPONSIF) ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 md:p-4 p-0">
          
          {/* Box Form: Di HP menempel di bawah, di Laptop melayang di tengah */}
          <div className="bg-white w-full max-w-md md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-auto animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 md:zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
              <h3 className="font-black text-lg text-stone-900">{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-stone-900 bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Foto Menu</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 relative">
                    <img src={formData.image_url || defaultImage} alt="Preview" className="w-full h-full object-cover" />
                    {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white"><Loader2 className="w-5 h-5 animate-spin" /></div>}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-3 text-center bg-gray-50 active:bg-gray-100">
                      <span className="text-xs font-bold text-stone-700 flex justify-center items-center gap-1"><UploadCloud className="w-4 h-4"/> Pilih Foto</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Nama Produk</label>
                <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-bold" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Kategori</label>
                  <select required value={formData.category_id} onChange={e=>setFormData({...formData, category_id: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-stone-700">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Stok Awal</label>
                  <input type="number" required value={formData.stock} onChange={e=>setFormData({...formData, stock: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Harga (Rp)</label>
                <input type="number" required value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 font-black text-orange-600 text-lg" />
              </div>

              <div className="pt-2 pb-4">
                <button disabled={uploading} type="submit" className="w-full bg-stone-900 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 disabled:opacity-50">
                  SIMPAN PRODUK
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

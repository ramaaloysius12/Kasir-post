'use client';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, Search, Plus, Minus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { items, addItem, updateQuantity } = useCartStore();

  useEffect(() => {
    fetch('http://localhost:8000/api/products/')
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const defaultImage = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80";

  return (
    <main 
      className="min-h-screen pb-10 relative bg-fixed bg-center bg-cover"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1920&q=80')" }}
    >
      <div className="absolute inset-0 bg-black/50 z-0 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="bg-white px-5 py-4 rounded-b-3xl shadow-lg sticky top-0 z-20">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-black text-stone-900">☕ Coffee Shop</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 text-gray-400 w-5 h-5" />
            <input 
              type="text" placeholder="Cari menu kesukaanmu..." 
              className="w-full bg-gray-100 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all border border-gray-200 font-medium text-stone-900"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-white" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map(product => {
                const cartItem = items.find(i => i.id === product.id);
                return (
                  <div key={product.id} className="bg-white p-3.5 rounded-2xl shadow-xl flex flex-col justify-between border border-gray-100">
                    <div>
                      <div className="h-32 w-full rounded-xl mb-3 overflow-hidden bg-gray-100 relative">
                        <img src={product.image_url || defaultImage} alt={product.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 bg-black/80 text-white text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                          {product.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-stone-900 text-sm leading-snug mb-1 line-clamp-2">{product.name}</h3>
                      {/* Harga diubah menjadi warna oranye terang agar menonjol */}
                      <p className="text-orange-600 font-black text-base mb-1">Rp {product.price.toLocaleString('id-ID')}</p>
                      <p className="text-[11px] text-gray-500 font-semibold mb-3">Sisa Stok: {product.stock}</p>
                    </div>

                    <div className="mt-2 border-t border-gray-100 pt-3">
                      {cartItem ? (
                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-center justify-between bg-gray-100 rounded-xl p-1.5 border border-gray-200">
                            {/* Tombol Minus - Putih dengan ikon merah */}
                            <button onClick={() => updateQuantity(product.id, cartItem.quantity - 1)} className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm text-red-500 hover:bg-gray-50 active:scale-95">
                              <Minus className="w-5 h-5" />
                            </button>
                            {/* Angka Kuantiti - Hitam tebal */}
                            <span className="text-base font-black text-stone-900">{cartItem.quantity}</span>
                            {/* Tombol Plus - Hitam pekat */}
                            <button onClick={() => updateQuantity(product.id, cartItem.quantity + 1)} className="w-9 h-9 bg-stone-900 text-white rounded-lg flex items-center justify-center shadow hover:bg-stone-800 active:scale-95">
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                          {/* Tombol Bayar - Hijau cerah */}
                          <button 
                            onClick={() => router.push('/checkout')} 
                            className="w-full bg-emerald-600 text-white py-3 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 uppercase tracking-wider"
                          >
                            <ShoppingBag className="w-4 h-4" /> BAYAR
                          </button>
                        </div>
                      ) : (
                        /* Tombol Tambah - Hitam pekat agar sangat jelas */
                        <button 
                          onClick={() => addItem(product)} 
                          disabled={product.stock === 0} 
                          className="w-full bg-stone-900 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-stone-800 shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:bg-gray-300 disabled:text-gray-500"
                        >
                          <Plus className="w-5 h-5" /> Tambah
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

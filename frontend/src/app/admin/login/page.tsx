'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  // State dikosongkan agar form tidak terisi otomatis
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('admin_token', data.access_token);
        router.push('/admin/dashboard');
      } else {
        setError(data.message || 'Login gagal');
      }
    } catch (err) {
      setError('Gagal menghubungi server');
    }
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 relative bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1920&q=80')" }}
    >
      <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none"></div>

      <form onSubmit={handleLogin} className="relative z-10 bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">☕</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900">Admin Login</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Sistem Manajemen POS</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-5 font-bold text-center border border-red-200">{error}</div>}
        
        <div className="space-y-5 mb-8">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 ml-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              placeholder="Masukkan email admin..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-stone-900 text-sm font-medium transition-all" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 ml-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-stone-900 text-sm font-medium transition-all" 
              required 
            />
          </div>
        </div>
        
        <button disabled={loading} type="submit" className="w-full bg-stone-900 text-white font-black py-4 rounded-2xl hover:bg-stone-800 disabled:opacity-70 transition-all active:scale-95 shadow-xl">
          {loading ? 'MEMERIKSA...' : 'MASUK SEKARANG'}
        </button>
      </form>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, LogOut, Coffee, Package, Ticket, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  if (!isAuthenticated) return null;
  if (pathname === '/admin/login') return <>{children}</>;

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const navs = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Pesanan', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Menu Produk', path: '/admin/products', icon: Package },
    { name: 'Voucher', path: '/admin/vouchers', icon: Ticket },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-stone-900 font-sans overflow-hidden">
      
      {/* ================= DESKTOP SIDEBAR ================= */}
      {/* Sidebar ini HANYA TAMPIL di layar lebar (Laptop/Tablet PC) */}
      <aside className="hidden md:flex w-72 bg-stone-950 text-gray-300 flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-stone-800/50 bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-500/20">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-wide">RamaPOS</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {navs.map(nav => {
            const active = pathname === nav.path;
            return (
              <Link 
                key={nav.path} href={nav.path} 
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold ${
                  active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'hover:bg-stone-800 text-gray-400 hover:text-white'
                }`}
              >
                <nav.icon className="w-5 h-5" />
                <span>{nav.name}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-stone-800/50">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-bold">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* MOBILE HEADER & HAMBURGER (HANYA TAMPIL di Layar HP) */}
        <header className="md:hidden flex items-center justify-between bg-stone-950 px-5 py-4 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white">
              <Coffee className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black text-white tracking-wide">RamaPOS</h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="text-gray-300 hover:text-white p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </header>

        {/* MOBILE DROPDOWN NAVIGATION */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-[68px] left-0 right-0 bg-stone-950 border-t border-stone-800 z-40 shadow-2xl flex flex-col p-4">
            <nav className="flex flex-col gap-2 mb-4">
              {navs.map(nav => {
                const active = pathname === nav.path;
                return (
                  <Link 
                    key={nav.path} href={nav.path} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold ${
                      active ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-stone-800 hover:text-white'
                    }`}
                  >
                    <nav.icon className="w-5 h-5" />
                    <span>{nav.name}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="border-t border-stone-800 pt-4">
              <button onClick={handleLogout} className="flex items-center justify-center gap-3 px-4 py-3.5 w-full rounded-xl text-red-400 bg-red-500/10 font-bold active:scale-95">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>
        )}

        {/* SCROLLABLE PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 relative z-0">
          {/* Latar Belakang Gelap Bagian Atas (Hanya aktif di Desktop) */}
          <div className="absolute top-0 left-0 right-0 h-64 bg-stone-900 z-0 hidden md:block"></div>
          
          {/* Area Render Halaman */}
          <div className="relative z-10 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

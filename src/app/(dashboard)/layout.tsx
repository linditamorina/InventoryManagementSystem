'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { LayoutDashboard, Package, LogOut, Settings } from 'lucide-react';
// IMPORTI I NAVBAR-IT ME ZILEN QË RREGULLUAM
import Navbar from '../../components/layout/Navbar'; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Gabim gjatë daljes:', error);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      
      {/* 1. SIDEBAR NGA KODI YT I VJETËR (Me logjikën e klikimeve) */}
      <aside className="w-64 bg-[#1a1a1a] text-white flex flex-col shrink-0 italic z-[100]">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="bg-red-600 p-2 rounded-lg text-white"><Package size={22} /></div>
          <span className="text-xl font-black uppercase tracking-tighter">Inventory</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4 font-bold text-sm">
          {/* Lidhjet që bëjnë URL-në të ndryshojë! */}
          <Link href="/dashboard" className={`flex items-center gap-4 px-4 py-3 rounded-xl ${pathname === '/dashboard' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/inventory" className={`flex items-center gap-4 px-4 py-3 rounded-xl ${pathname === '/inventory' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
            <Package size={20} /> Inventory
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4 text-slate-400 font-bold text-sm">
          <div className="flex items-center gap-4 px-4 cursor-pointer hover:text-white transition-all">
            <Settings size={20} /> Settings
          </div>
          <button onClick={handleLogout} className="flex items-center gap-4 px-4 w-full text-red-500 hover:text-red-400 transition-all font-bold">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* 2. PJESA KRYESORE ME STRUKTURËN E RE (Që zhbllokon klikimet e ziles) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* THËRRASIM NAVBAR-IN QË NDËRTUAM (Me z-index të saktë) */}
        <Navbar />

        {/* 3. CONTENT AREA (Këtu shfaqet Dashboard ose Inventory) */}
        <main className="flex-1 overflow-y-auto p-10">
          {children} 
        </main>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Search, Bell, Settings as SettingsIcon, HelpCircle, X, PackageOpen } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotification'; 
import { supabase } from '../../lib/supabase';

export default function Navbar() {
  const { notifications, unreadCount } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-8 relative z-[50]">
      
      {/* 1. SEARCH - Shtojmë flex-1 dhe max-w që të mos pushtojë hapësirën */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search items..." 
          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-red-500/20 outline-none text-sm transition-all"
        />
      </div>
      
      {/* 2. ICONS & PROFILE */}
      <div className="flex items-center gap-2 lg:gap-5 ml-4">
        
        {/* BELL CONTAINER */}
        <div className="relative">
          <button 
            type="button"
            // Klikimi direkt këtu
            onClick={(e) => {
              e.stopPropagation();
              console.log("KLIKIM I PASTER!");
              setIsDropdownOpen(!isDropdownOpen);
            }}
            // Përdorim h-10 w-10 që të jetë zonë e lehtë për t'u klikuar
            className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all relative z-[60] cursor-pointer hover:bg-gray-100 ${
              isDropdownOpen ? 'text-red-600 bg-red-50' : 'text-gray-400'
            }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white pointer-events-none">
                {unreadCount}
              </span>
            )}
          </button>

          {/* DROPDOWN PANEL */}
          {isDropdownOpen && (
            <>
              {/* Overlay transparent që kap klikimet jashtë */}
              <div 
                className="fixed inset-0 z-[55] bg-transparent" 
                onClick={() => setIsDropdownOpen(false)} 
              />
              
              <div className="absolute top-full right-0 mt-3 w-80 bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden z-[70] animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center text-gray-600">
                  <span className="text-[10px] font-black uppercase tracking-widest italic">Njoftimet ({unreadCount})</span>
                  <X 
                    size={16} 
                    className="cursor-pointer hover:text-red-600" 
                    onClick={() => setIsDropdownOpen(false)} 
                  />
                </div>

                <div className="max-h-64 overflow-y-auto bg-white">
                  {notifications?.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">
                      <PackageOpen size={30} className="mx-auto mb-2 opacity-20" />
                      <p className="text-[10px] font-bold uppercase italic tracking-tighter">S'ka njoftime të reja</p>
                    </div>
                  ) : (
                    notifications?.map((n: any) => (
                      <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <p className="text-[11px] font-bold text-gray-700 italic uppercase leading-tight">
                          {n.message}
                        </p>
                        <span className="text-[9px] text-gray-400 mt-1 block">Tani</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-2.5 rounded-xl hover:bg-gray-100 cursor-pointer text-gray-400 transition-all">
          <SettingsIcon size={20} />
        </div>
        
        <div className="p-2.5 rounded-xl hover:bg-gray-100 cursor-pointer text-gray-400 transition-all">
          <HelpCircle size={20} />
        </div>
        
        {/* PROFILE */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100 ml-2 cursor-pointer group">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xs font-black italic shadow-sm group-hover:scale-105 transition-all">
            DB
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-black text-gray-800 italic uppercase tracking-tighter leading-none">Dion Beqiri</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
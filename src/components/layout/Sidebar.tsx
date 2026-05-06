'use client';

import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Truck, BarChart3, Building } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Ruajmë vetëm çelësat e përkthimit (Translation Keys)
  const menuItems = [
    { icon: LayoutDashboard, label: 'sidebar_dashboard', path: '/dashboard' },
    { icon: Package, label: 'sidebar_inventory', path: '/inventory' },
    { icon: ShoppingCart, label: 'sidebar_sales', path: '/sales' },
    { icon: Truck, label: 'sidebar_purchases', path: '/purchases' },
    { icon: BarChart3, label: 'sidebar_reports', path: '/reports' },
    { icon: Building, label: 'about_company', path: '/dashboard/about-company' },
  ];

  return (
    <aside className="w-64 bg-[#1a1c1e] text-gray-400 flex flex-col min-h-screen">
      <div className="p-6 flex items-center gap-3 text-white">
        <div className="bg-red-600 p-2 rounded-lg">
          <Package size={24} />
        </div>
        {/* Titulli i Sidebar-it */}
        <span className="font-bold text-xl tracking-tight">
          {t('sidebar_app_name')}
        </span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              href={item.path} 
              key={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                isActive 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                  : 'hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {/* Përkthimi dinamik ndodh këtu */}
              <span className="font-medium">{t(item.label)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
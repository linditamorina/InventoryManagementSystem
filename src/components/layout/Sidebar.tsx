'use client';

import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Truck, BarChart3, Building } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: ShoppingCart, label: 'Sales', path: '/sales' },
  { icon: Truck, label: 'Purchases', path: '/purchases' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Building, label: 'About Company', path: '/dashboard/about-company' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1a1c1e] text-gray-400 flex flex-col min-h-screen">
      {/* Headeri i Sidebar-it */}
      <div className="p-6 flex items-center gap-3 text-white">
        <div className="bg-red-600 p-2 rounded-lg">
          <Package size={24} />
        </div>
        <span className="font-bold text-xl tracking-tight">Inventory</span>
      </div>
      
      {/* Navigimi */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              href={item.path} 
              key={item.label}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                isActive 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                  : 'hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
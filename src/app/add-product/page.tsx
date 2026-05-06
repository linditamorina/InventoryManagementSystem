'use client';

import { Package, DollarSign, List, Save, X } from 'lucide-react';
import Link from 'next/link';
// Importo hook-un e gjuhës
import { useLanguage } from "../../context/LanguageContext"; 

const translations = {
  en: {
    title: "Add Product",
    nameLabel: "Product Name",
    namePlaceholder: "e.g. Samsung Galaxy S24",
    priceLabel: "Price (€)",
    stockLabel: "Stock Quantity",
    saveBtn: "Save Product",
    cancel: "Cancel"
  },
  sq: {
    title: "Shto Produkt",
    nameLabel: "Emri i Produktit",
    namePlaceholder: "p.sh. Samsung Galaxy S24",
    priceLabel: "Çmimi (€)",
    stockLabel: "Sasia në Stok",
    saveBtn: "Ruaj Produktin",
    cancel: "Anulo"
  }
};

export default function AddProductPage() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.sq;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
          {t.title.split(' ')[0]} <span className="text-red-600">{t.title.split(' ')[1] || ''}</span>
        </h1>
        <Link 
          href="/" 
          className="bg-white p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 shadow-sm transition-all"
          title={t.cancel}
        >
          <X size={24}/>
        </Link>
      </div>

      <form className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8 italic">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
              {t.nameLabel}
            </label>
            <input 
              type="text" 
              className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all font-bold" 
              placeholder={t.namePlaceholder} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
              {t.priceLabel}
            </label>
            <input 
              type="number" 
              className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all font-bold" 
              placeholder="0.00" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
              {t.stockLabel}
            </label>
            <input 
              type="number" 
              className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all font-bold" 
              placeholder="0" 
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-red-600 text-white font-black py-6 rounded-2xl hover:bg-slate-900 shadow-xl shadow-red-600/20 transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-3"
        >
          <Save size={20} /> {t.saveBtn}
        </button>
      </form>
    </div>
  );
}
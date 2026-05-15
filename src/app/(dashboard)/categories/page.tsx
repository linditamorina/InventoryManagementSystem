"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { 
  Plus, Pencil, Trash2, X, Save, 
  LayoutGrid, Loader2, AlertCircle, 
  Hash, Search, AlertTriangle
} from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<{ id?: string; name: string }>({ name: '' });
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (!currentCategory.name.trim()) return;
    setIsSaving(true);
    try {
      if (currentCategory.id) {
        const { error } = await supabase
          .from('categories')
          .update({ name: currentCategory.name })
          .eq('id', currentCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{ name: currentCategory.name }])
          .select();
        if (error) throw error;
      }
      setIsModalOpen(false);
      setCurrentCategory({ name: '' });
      await fetchCategories();
    } catch (error: any) {
      alert("Gabim: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Funksioni për të hapur modalin e fshirjes
  const confirmDelete = (id: string) => {
    setCategoryToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Funksioni që kryen fshirjen reale
  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryToDelete);
      
      if (error) throw error;
      await fetchCategories();
    } catch (error) {
      alert("Gabim gjatë fshirjes.");
    } finally {
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-10 min-h-screen bg-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-xl text-white">
              <LayoutGrid size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Kategoritë</h1>
          </div>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] ml-12">Strukturimi i Inventarit</p>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Kërko kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-red-600 font-bold text-sm"
            />
          </div>
          <button 
            onClick={() => { setCurrentCategory({ name: '' }); setIsModalOpen(true); }}
            className="bg-[#111827] hover:bg-red-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 transition-all font-black uppercase text-xs tracking-widest"
          >
            <Plus size={18} strokeWidth={3} /> Shto
          </button>
        </div>
      </div>

      {/* GRIDI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-[2rem] border-2 border-slate-100" />)
        ) : filteredCategories.map((cat) => (
          <div key={cat.id} className="group bg-white border-2 border-slate-100 p-6 rounded-[2rem] hover:border-red-600 hover:shadow-xl transition-all flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-slate-100 group-hover:bg-red-50 p-3 rounded-2xl text-slate-400 group-hover:text-red-600 transition-colors">
                <Hash size={20} strokeWidth={3} />
              </div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight">{cat.name}</h3>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setCurrentCategory(cat); setIsModalOpen(true); }} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600"><Pencil size={16} /></button>
              <button onClick={() => confirmDelete(cat.id)} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-red-600"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL PËR SHTIM/EDITIM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[150] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white">
            <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
              <h2 className="text-xl font-black uppercase tracking-tighter">{currentCategory.id ? 'Edito' : 'Shto'} Kategori</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-red-600 rounded-xl transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <input 
                type="text"
                value={currentCategory.name}
                onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-slate-900 font-black text-lg uppercase"
                placeholder="EMRI I KATEGORISË..."
              />
              <button onClick={handleSave} disabled={isSaving} className="w-full bg-red-600 text-white font-black py-5 rounded-2xl hover:bg-slate-900 uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-lg">
                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                Ruaj Ndryshimet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PËR FSHIRJE (NË VEND TË ALERT) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-red-950/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center space-y-6 border-4 border-red-50">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-red-600">
              <AlertTriangle size={40} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">A jeni i sigurt?</h3>
              <p className="text-slate-500 font-medium mt-2">Ky veprim nuk mund të kthehet mbrapa. Kategoria do të fshihet përgjithmonë.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl uppercase text-xs tracking-widest transition-all"
              >
                Anulo
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl uppercase text-xs tracking-widest transition-all shadow-lg shadow-red-200"
              >
                Po, Fshije
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
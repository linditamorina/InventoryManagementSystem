'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Eye, EyeOff, ShieldCheck, Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext'; // Sigurohu që path-i është i saktë

export default function ResetPasswordPage() {
  const { t, language, setLanguage } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState({ current: false, new: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const isPasswordValid = newPassword.length >= 6;

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'sq' : 'en');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setMessage({ type: 'error', text: t('password_min_length') || 'MIN. 6 KARAKTERE' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("User not found");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) throw new Error(t('toast_error_updating'));

      const { error: updateError } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (updateError) throw updateError;

      setMessage({ type: 'success', text: t('toast_staff_updated') });
      setCurrentPassword('');
      setNewPassword('');
      
      setTimeout(() => router.push('/dashboard'), 2000);

    } catch (error: any) {
      setMessage({ type: 'error', text: t('toast_system_error').toUpperCase() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 italic">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        
        {/* BUTTONI I GJUHËS (SHTUAR SI TE LOGIN) */}
        <button 
          onClick={toggleLanguage}
          className="absolute right-6 top-8 z-20 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-white hover:bg-white/20 transition-all"
        >
          <Languages size={14} />
          <span className="text-[10px] font-black uppercase tracking-tighter">{language}</span>
        </button>

        <button 
          onClick={() => router.back()} 
          className="absolute left-6 top-8 text-white/50 hover:text-white z-10 p-2 hover:bg-white/10 rounded-xl transition-all"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="bg-red-600 p-12 text-center text-white">
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">{t('change_password')}</h1>
          <p className="text-[10px] font-bold opacity-70 uppercase tracking-[0.2em] mt-2 text-white/80">{t('real_time_analysis')}</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="p-10 space-y-5">
          {message.text && (
            <div className={`p-4 rounded-2xl text-[11px] font-black border flex items-center gap-3 animate-in fade-in slide-in-from-top-1 ${
              message.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('password_label')} (Aktual)</label>
            <div className="relative">
              <input 
                required 
                type={showPass.current ? "text" : "password"} 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-bold transition-all text-slate-900" 
                placeholder="••••••••" 
              />
              <button 
                type="button" 
                onClick={() => setShowPass({...showPass, current: !showPass.current})}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-600"
              >
                {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('staff_new_password')}</label>
              <span className={`text-[9px] font-black uppercase ${isPasswordValid ? 'text-green-500' : 'text-slate-300'}`}>
                Min. 6
              </span>
            </div>
            <div className="relative">
              <input 
                required 
                type={showPass.new ? "text" : "password"} 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className={`w-full p-4 pr-12 bg-slate-50 border rounded-2xl outline-none transition-all font-bold text-slate-900 ${
                    newPassword.length > 0 ? (isPasswordValid ? 'border-green-200 focus:ring-green-500' : 'border-red-200 focus:ring-red-600') : 'border-slate-200 focus:ring-red-600'
                }`}
                placeholder="••••••••" 
              />
              <button 
                type="button" 
                onClick={() => setShowPass({...showPass, new: !showPass.new})}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-600"
              >
                {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            disabled={loading || (newPassword.length > 0 && !isPasswordValid)} 
            type="submit"
            className="w-full bg-[#1a1a1a] text-white font-black py-5 rounded-2xl hover:bg-red-600 shadow-xl transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                    <ShieldCheck size={20} />
                    <span>{t('staff_save_btn')}</span>
                </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User, Loader2, ArrowLeft, CheckCircle2, AlertCircle, Languages } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from "../../context/LanguageContext"; 

const translations = {
  en: {
    title: "Registration",
    subtitle: "Create a new account",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "John Doe",
    emailLabel: "Email",
    emailPlaceholder: "email@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    registerBtn: "Create Account",
    loading: "Creating...",
    alreadyHaveAccount: "Already have an account?",
    loginLink: "Login",
    successMsg: "Account created successfully! Please check your email for confirmation.",
    errorGeneric: "An unexpected error occurred.",
    backTitle: "Back to Login",
    switchLang: "SQ"
  },
  sq: {
    title: "Regjistrimi",
    subtitle: "Krijo llogari të re",
    fullNameLabel: "Emri i Plotë",
    fullNamePlaceholder: "Filan Fisteku",
    emailLabel: "Email",
    emailPlaceholder: "email@shembull.com",
    passwordLabel: "Fjalëkalimi",
    passwordPlaceholder: "••••••••",
    registerBtn: "Krijo Llogarinë",
    loading: "Duke u krijuar...",
    alreadyHaveAccount: "Keni llogari?",
    loginLink: "Identifikohuni",
    successMsg: "Llogaria u krijua me sukses! Ju lutem kontrolloni email-in për konfirmim.",
    errorGeneric: "Ndodhi një gabim i papritur.",
    backTitle: "Kthehu te Login",
    switchLang: "EN"
  }
};

export default function RegisterPage() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.sq;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'sq' : 'en');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });

      if (error) {
        setMsg({ type: 'error', text: error.message });
      } else {
        setMsg({ type: 'success', text: t.successMsg });
        setEmail(''); setPassword(''); setFullName('');
      }
    } catch (err) {
      setMsg({ type: 'error', text: t.errorGeneric });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 italic">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in duration-500">
        
        <div className="bg-[#1a1a1a] p-10 text-center flex flex-col items-center gap-4 relative">
          {/* Butoni Back */}
          <button 
            onClick={() => router.push('/login')}
            className="absolute left-8 top-10 text-slate-500 hover:text-white transition-colors"
            title={t.backTitle}
          >
            <ArrowLeft size={24} />
          </button>

          {/* BUTONI I GJUHËS (Shtuar këtu) */}
          <button 
            onClick={toggleLanguage}
            className="absolute right-8 top-10 flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-400 px-3 py-1.5 rounded-xl transition-all border border-white/10"
          >
            <Languages size={16} />
            <span className="text-[10px] font-black">{t.switchLang}</span>
          </button>
          
          <div className="bg-red-600 p-4 rounded-2xl text-white shadow-lg">
            <UserPlus size={32} />
          </div>
          <h1 className="text-white text-3xl font-black uppercase tracking-tighter">
            {t.title}
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            {t.subtitle}
          </p>
        </div>

        <form onSubmit={handleRegister} className="p-10 space-y-5">
          {msg.text && (
            <div className={`p-4 rounded-xl text-[11px] font-bold border flex items-center gap-3 ${
              msg.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
            }`}>
              {msg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              {msg.text}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.fullNameLabel}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-bold transition-all"
                placeholder={t.fullNamePlaceholder} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.emailLabel}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-bold transition-all"
                placeholder={t.emailPlaceholder} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.passwordLabel}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-bold transition-all"
                placeholder={t.passwordPlaceholder} />
            </div>
          </div>

          <button disabled={loading} type="submit"
            className="w-full bg-[#1a1a1a] text-white font-black py-5 rounded-2xl hover:bg-red-600 shadow-xl transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 mt-2 disabled:opacity-50"
          >
            {loading ? <><Loader2 className="animate-spin" size={20} /> {t.loading}</> : t.registerBtn}
          </button>

          <div className="pt-4 text-center border-t border-slate-50">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {t.alreadyHaveAccount} <Link href="/login" className="text-red-600 hover:underline">{t.loginLink}</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
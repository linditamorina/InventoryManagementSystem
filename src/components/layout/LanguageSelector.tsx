'use client';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-1 bg-slate-200/50 p-1 rounded-xl border border-slate-200 shadow-inner relative z-[60] min-w-[80px]">
      <button
        type="button"
        onClick={() => setLanguage('sq')}
        className={`flex-1 px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
          language === 'sq' 
            ? 'bg-white text-red-600 shadow-md scale-105' 
            : 'text-slate-500 hover:bg-slate-200'
        }`}
      >
        SQ
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex-1 px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
          language === 'en' 
            ? 'bg-white text-red-600 shadow-md scale-105' 
            : 'text-slate-500 hover:bg-slate-200'
        }`}
      >
        EN
      </button>
    </div>
  );
}
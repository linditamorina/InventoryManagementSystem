'use client';

import React, { useState, useEffect } from 'react';
import { useAboutCompany } from '../../../../hooks/useAboutCompany'; 
import { useRouter } from 'next/navigation'; 
import { Save, Image as ImageIcon, MapPin, Phone, Mail, Globe, Building, Users, FileText, CheckCircle2, Landmark, CreditCard, Info } from 'lucide-react';
// Importojmë hook-un e gjuhës
import { useLanguage } from '../../../../context/LanguageContext';

export default function AboutCompanyPage() {
  const { aboutCompany, updateAboutCompany, uploadLogo, userRole, isUpdating } = useAboutCompany();
  const router = useRouter();
  const { t } = useLanguage(); // Përdorim t()
  const isAdmin = userRole === 'admin';
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'financial'>('general');

  const [formData, setFormData] = useState({
    company_name: '',
    description: '',
    founding_year: '',
    address: '', 
    phone: '',   
    email: '',   
    website: '', 
    registration_number: '',
    currency: 'EUR',
    bank_name: '',
    iban: '',
    swift_code: '',
    vat_number: ''
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (aboutCompany) {
      setFormData({
        company_name: aboutCompany.company_name || '',
        description: aboutCompany.description || '',
        founding_year: aboutCompany.founding_year?.toString() || '',
        address: aboutCompany.address || '',
        phone: aboutCompany.phone || '',
        email: aboutCompany.email || '',
        website: aboutCompany.website || '',
        registration_number: aboutCompany.registration_number || '',
        currency: aboutCompany.currency || 'EUR',
        bank_name: aboutCompany.bank_name || '',
        iban: aboutCompany.iban || '',
        swift_code: aboutCompany.swift_code || '',
        vat_number: aboutCompany.vat_number || ''
      });
      setLogoPreview(aboutCompany.logo_url || null);
    }
  }, [aboutCompany]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateAboutCompany({ 
      ...formData, 
      founding_year: formData.founding_year ? parseInt(formData.founding_year) : null 
    }, {
      onSuccess: () => {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          router.push('/dashboard'); 
        }, 2000);
      }
    });
  };

  return (
    <div className="h-[calc(100vh-120px)] flex items-center justify-center p-4 overflow-hidden">
      <div className={`max-w-5xl w-full bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full max-h-[750px] transition-all ${showSuccessModal ? 'blur-md pointer-events-none' : ''}`}>
        
        {/* Header - Fixed */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white rounded-t-[2.5rem]">
          <div>
            <h1 className="text-2xl font-black text-slate-900 italic tracking-tight uppercase">{t('about_company')}</h1>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">{t('identity_management')}</p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} label={t('tab_general')} icon={<Info size={16}/>} />
            <TabButton active={activeTab === 'contact'} onClick={() => setActiveTab('contact')} label={t('tab_contact')} icon={<MapPin size={16}/>} />
            <TabButton active={activeTab === 'financial'} onClick={() => setActiveTab('financial')} label={t('tab_financial')} icon={<CreditCard size={16}/>} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            {/* TAB 1: GENERAL */}
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-8 bg-slate-50/50 p-6 rounded-[2rem] border border-dashed border-slate-200">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center relative shadow-sm border-2 border-slate-100 overflow-hidden group">
                    {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-200" size={32} />}
                    {isAdmin && (
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setLogoPreview(reader.result as string);
                          reader.readAsDataURL(file);
                          uploadLogo(file);
                        }
                      }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg italic">{t('official_logo')}</h3>
                    <p className="text-xs text-slate-400 font-medium">{isAdmin ? t('logo_change_tip') : t('logo_description')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label={t('business_name')} icon={<Building size={18} />}>
                    <input type="text" disabled={!isAdmin} value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} className="input-field" required />
                  </InputGroup>
                  <InputGroup label={t('founding_year')} icon={<Users size={18} />}>
                    <input type="number" disabled={!isAdmin} value={formData.founding_year} onChange={(e) => setFormData({...formData, founding_year: e.target.value})} className="input-field" />
                  </InputGroup>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t('description')}</label>
                  <textarea disabled={!isAdmin} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 focus:ring-2 focus:ring-slate-900 outline-none transition min-h-[100px] resize-none" />
                </div>
              </div>
            )}

            {/* TAB 2: CONTACT */}
            {activeTab === 'contact' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <InputGroup label={t('physical_address')} icon={<MapPin size={18} />}>
                  <input type="text" disabled={!isAdmin} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="input-field" />
                </InputGroup>
                <InputGroup label={t('phone_number')} icon={<Phone size={18} />}>
                  <input type="tel" disabled={!isAdmin} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input-field" />
                </InputGroup>
                <InputGroup label={t('official_email')} icon={<Mail size={18} />}>
                  <input type="email" disabled={!isAdmin} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input-field" />
                </InputGroup>
                <InputGroup label={t('website')} icon={<Globe size={18} />}>
                  <input type="url" disabled={!isAdmin} value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="input-field" />
                </InputGroup>
                <InputGroup label={t('registration_number')} icon={<FileText size={18} />}>
                  <input type="text" disabled={!isAdmin} value={formData.registration_number} onChange={(e) => setFormData({...formData, registration_number: e.target.value})} className="input-field" />
                </InputGroup>
              </div>
            )}

            {/* TAB 3: FINANCIAL */}
            {activeTab === 'financial' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <InputGroup label={t('currency')} icon={<CreditCard size={18} />}>
                  <select disabled={!isAdmin} value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} className="input-field appearance-none">
                    <option value="EUR">€ - Euro (EUR)</option>
                    <option value="USD">$ - US Dollar (USD)</option>
                    <option value="ALL">L - Lek Shqiptar (ALL)</option>
                    <option value="GBP">£ - British Pound (GBP)</option>
                  </select>
                </InputGroup>
                <InputGroup label={t('vat_number')} icon={<FileText size={18} />}>
                  <input type="text" disabled={!isAdmin} value={formData.vat_number} onChange={(e) => setFormData({...formData, vat_number: e.target.value})} className="input-field" />
                </InputGroup>
                <InputGroup label={t('bank_name')} icon={<Landmark size={18} />}>
                  <input type="text" disabled={!isAdmin} value={formData.bank_name} onChange={(e) => setFormData({...formData, bank_name: e.target.value})} className="input-field" />
                </InputGroup>
                <InputGroup label={t('iban')} icon={<CreditCard size={18} />}>
                  <input type="text" disabled={!isAdmin} value={formData.iban} onChange={(e) => setFormData({...formData, iban: e.target.value})} className="input-field" />
                </InputGroup>
              </div>
            )}
          </div>

          {/* Footer - Fixed Action Button */}
          <div className="p-8 bg-slate-50/50 border-t border-slate-100 rounded-b-[2.5rem]">
            {isAdmin && (
              <button type="submit" disabled={isUpdating} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] disabled:opacity-50">
                {isUpdating ? t('saving') : <><Save size={20} /> {t('save_changes')}</>}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] p-10 flex flex-col items-center max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} strokeWidth={3} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">{t('success_title')}</h3>
            <p className="text-slate-500 text-center text-sm font-medium">{t('success_update_message')}</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          background-color: white;
          border-radius: 1.25rem;
          border: 1px solid #e2e8f0;
          outline: none;
          transition: all 0.2s;
          font-size: 0.875rem;
          color: #1e293b;
          font-weight: 500;
        }
        .input-field:disabled {
          background-color: #f8fafc; 
          color: #334155; 
          opacity: 1;
          -webkit-text-fill-color: #334155; 
          cursor: not-allowed;
        }
        .input-field:focus {
          border-color: #0f172a;
          box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function InputGroup({ label, icon, children }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4 italic">
        {label}
      </label>
      <div className="relative text-slate-500">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">{icon}</div>
        {children}
      </div>
    </div>
  );
}
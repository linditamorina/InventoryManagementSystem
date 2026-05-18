"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react'; // Ndryshuam Printer me Download
import { useLanguage } from "../../../context/LanguageContext";
import { useAboutCompany } from "../../../hooks/useAboutCompany";

// Importet për gjenerimin e PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const translations = {
  en: {
    title: "Reports & Analytics",
    downloadPDF: "Download PDF",
    aiPredictor: "AI Predictor",
    loadingText: "Analyzing data...",
    noData: "No data available for this period.",
    ready: "Click generate for AI analysis.",
    generateBtn: "Generate Analysis",
    startDate: "Start Date",
    endDate: "End Date",
    totalIn: "Total In",
    totalOut: "Total Out",
    units: "units",
    chartTitle: "Stock Movement Overview",
    loading: "Loading...",
    no_data: "No movements found."
  },
  sq: {
    title: "Raportet & Analitika",
    downloadPDF: "Shkarko PDF",
    aiPredictor: "Analisti AI",
    loadingText: "Duke analizuar...",
    noData: "S'ka të dhëna për këtë periudhë.",
    ready: "Kliko gjenero për analizë AI.",
    generateBtn: "Gjenero Analizën",
    startDate: "Data Fillestare",
    endDate: "Data Përfundimtare",
    totalIn: "Hyrje Totale",
    totalOut: "Dalje Totale",
    units: "CP",
    chartTitle: "Pasqyra e Lëvizjeve të Stokut",
    loading: "Duke ngarkuar...",
    no_data: "Nuk u gjetën lëvizje."
  }
};

export default function ReportsPage() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.sq;

  const { aboutCompany } = useAboutCompany();
  const [currencySymbol, setCurrencySymbol] = useState("€");

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    if (aboutCompany?.currency) {
      const c = aboutCompany.currency.toUpperCase();
      if (c === 'USD') setCurrencySymbol('$');
      else if (c === 'EUR') setCurrencySymbol('€');
      else if (c === 'ALL') setCurrencySymbol('L');
      else if (c === 'GBP') setCurrencySymbol('£');
      else setCurrencySymbol(aboutCompany.currency);
    }
  }, [aboutCompany]);

  useEffect(() => {
    const fetchRealData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('stock_movements') 
          .select(`
            created_at, type, quantity, product_id,
            products (name, sku, category, price, quantity)
          `) 
          .gte('created_at', `${startDate}T00:00:00Z`)
          .lte('created_at', `${endDate}T23:59:59Z`);

        if (error) throw error;
        setRawData(data || []);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRealData();
  }, [supabase, startDate, endDate]);

  const { chartData, totals } = useMemo(() => {
    let hyrjeTotale = 0;
    let daljeTotale = 0;
    const groupedData: Record<string, { name: string; hyrje: number; dalje: number }> = {};

    rawData.forEach((log) => {
      const date = new Date(log.created_at).toLocaleDateString(language === 'sq' ? 'sq-AL' : 'en-US', { day: '2-digit', month: 'short' });
      if (!groupedData[date]) {
        groupedData[date] = { name: date, hyrje: 0, dalje: 0 };
      }
      
      if (log.type?.toUpperCase() === 'IN') {
        groupedData[date].hyrje += Number(log.quantity);
        hyrjeTotale += Number(log.quantity);
      } else if (log.type?.toUpperCase() === 'OUT') {
        groupedData[date].dalje += Number(log.quantity);
        daljeTotale += Number(log.quantity);
      }
    });

    return { chartData: Object.values(groupedData), totals: { hyrje: hyrjeTotale, dalje: daljeTotale } };
  }, [rawData, language]);

  const productMovementsSummary = useMemo(() => {
    const summary: Record<string, any> = {};
    rawData.forEach((log) => {
      const prod = Array.isArray(log.products) ? log.products[0] : log.products;
      if (!prod) return;

      const pId = log.product_id;
      if (!summary[pId]) {
        summary[pId] = {
          sku: prod.sku || 'N/A', name: prod.name || 'Unknown', category: prod.category || 'N/A',
          price: Number(prod.price || 0), stok: Number(prod.quantity || 0), hyrje: 0, dalje: 0
        };
      }

      if (log.type?.toUpperCase() === 'IN') summary[pId].hyrje += Number(log.quantity || 0);
      else if (log.type?.toUpperCase() === 'OUT') summary[pId].dalje += Number(log.quantity || 0);
    });
    return Object.values(summary);
  }, [rawData]);

  // =======================================================================
  // LOGJIKA E AVANCUAR E PDF: Gjeneron dhe shkarkon direkt dokumentin!
  // =======================================================================
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Koka e Dokumentit (Të dhënat e kompanisë majtas)
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // Ngjyrë e errët
    doc.setFont("helvetica", "bold");
    doc.text(aboutCompany?.company_name?.toUpperCase() || "EMRI I KOMPANISË", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(aboutCompany?.address || "Adresa e panjohur", 14, 30);
    doc.text(`Tel: ${aboutCompany?.phone || "-"} | Email: ${aboutCompany?.email || "-"}`, 14, 35);

    // 2. Titulli i Raportit dhe Data (Djathtas)
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38); // Ngjyrë e kuqe
    doc.setFont("helvetica", "bold");
    doc.text("RAPORTI I INVENTARIT", pageWidth - 14, 22, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("PERIUDHA E AUDITIMIT", pageWidth - 14, 30, { align: "right" });
    
    doc.setTextColor(15, 23, 42);
    const dateStr = `${new Date(startDate).toLocaleDateString()}  -  ${new Date(endDate).toLocaleDateString()}`;
    doc.text(dateStr, pageWidth - 14, 35, { align: "right" });

    // Vija ndarëse e zezë
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(14, 42, pageWidth - 14, 42);

    // 3. Përmbledhja (Totalet)
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 163, 74); // Jeshile
    doc.text(`Hyrje Totale: +${totals.hyrje.toLocaleString()} ${t.units}`, 14, 52);
    
    doc.setTextColor(220, 38, 38); // E kuqe
    doc.text(`Dalje Totale: -${totals.dalje.toLocaleString()} ${t.units}`, 80, 52);

    // 4. Ndërtimi i Tabelës automatikisht
    const tableColumn = ["SKU", "Emri Artikullit", "Kategoria", "Çmimi", "Hyrje (+)", "Dalje (-)", "Stoku Live"];
    const tableRows: any[] = [];

    if (productMovementsSummary.length === 0) {
      tableRows.push(["-", "Nuk ka lëvizje për këtë periudhë", "-", "-", "-", "-", "-"]);
    } else {
      productMovementsSummary.forEach(item => {
        tableRows.push([
          item.sku,
          item.name,
          item.category,
          `${currencySymbol}${item.price.toFixed(2)}`,
          item.hyrje > 0 ? `+${item.hyrje}` : "0",
          item.dalje > 0 ? `-${item.dalje}` : "0",
          `${item.stok} CP`
        ]);
      });
    }

    // Vizatimi i Tabelës
    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9, textColor: 50 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        3: { halign: 'right', fontStyle: 'bold' }, // Çmimi
        4: { halign: 'center', textColor: [22, 163, 74], fontStyle: 'bold' }, // Hyrje (E gjelbër)
        5: { halign: 'center', textColor: [220, 38, 38], fontStyle: 'bold' }, // Dalje (E kuqe)
        6: { halign: 'center', fontStyle: 'bold' } // Stoku Live
      }
    });

    // 5. Nënshkrimet Zyrtare në fund të faqes
    const finalY = (doc as any).lastAutoTable.finalY || 60;
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    
    // Nënshkrimi Majtas (Stafi)
    doc.line(30, finalY + 40, 80, finalY + 40);
    doc.text("Përgatiti (Stafi)", 55, finalY + 46, { align: "center" });

    // Nënshkrimi Djathtas (Administratori)
    doc.line(pageWidth - 80, finalY + 40, pageWidth - 30, finalY + 40);
    doc.text("Aprovoi (Administratori)", pageWidth - 55, finalY + 46, { align: "center" });

    // 6. Shkarkimi Automatik i PDF-së
    const fileName = `Raporti_Inventarit_${startDate}_${endDate}.pdf`;
    doc.save(fileName);
  };
  // =======================================================================

  const handleGenerateAISuggestion = async () => {
    if (rawData.length === 0) return;
    setIsAiLoading(true);
    setAiSuggestion(null);

    try {
      const response = await fetch('/api/ai/process-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: JSON.stringify({ totals, periudha: `${startDate} - ${endDate}` }), 
          type: 'prediction' 
        }),
      });
      const aiData = await response.json();
      setAiSuggestion(aiData.recommendation || aiData.message || "Analiza u krye.");
    } catch (error) {
      setAiSuggestion("Gabim gjatë lidhjes me AI.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col p-4 md:p-8 bg-[#fafafa] gap-8 overflow-y-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
          {t.title}
        </h1>
        {/* Butoni tani thërret funksionin që shkarkon direkt PDF-në */}
        <button 
          onClick={handleDownloadPDF} 
          className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 shadow-xl transition-all active:scale-95"
        >
          <Download size={16} strokeWidth={2.5} /> {t.downloadPDF}
        </button>
      </div>

      <div className="flex flex-col gap-8 w-full">
        {/* Seksioni i AI */}
        <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
          <div className="p-4 md:p-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-600" />
              <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] italic">{t.aiPredictor}</h2>
            </div>
            <div className="text-center">
              {isAiLoading ? (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.loadingText}</p>
              ) : (
                <p className="text-sm font-bold text-slate-700 italic">
                  {aiSuggestion || (rawData.length === 0 ? t.noData : t.ready)}
                </p>
              )}
            </div>
            <button 
              onClick={handleGenerateAISuggestion}
              disabled={isAiLoading || rawData.length === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${rawData.length === 0 ? "bg-slate-50 text-slate-300" : "bg-slate-900 text-white hover:bg-red-600 shadow-lg"}`}
            >
              <Sparkles size={14} className={isAiLoading ? "animate-spin" : ""} />
              {t.generateBtn}
            </button>
          </div>
        </div>

        {/* Kalendari dhe Totale */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.startDate}</label>
               <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 text-sm rounded-xl px-4 py-3 font-bold" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.endDate}</label>
               <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 text-sm rounded-xl px-4 py-3 font-bold" />
            </div>
          </div>

          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
              <ArrowUpRight size={32} className="text-green-600" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t.totalIn}</p>
                <h3 className="text-3xl font-black italic text-slate-900">
                  {isLoading ? '...' : totals.hyrje.toLocaleString()} <span className="text-sm text-slate-300 font-bold uppercase">{t.units}</span>
                </h3>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
              <ArrowDownRight size={32} className="text-red-600" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t.totalOut}</p>
                <h3 className="text-3xl font-black italic text-slate-900">
                  {isLoading ? '...' : totals.dalje.toLocaleString()} <span className="text-sm text-slate-300 font-bold uppercase">{t.units}</span>
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Grafiku */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col min-h-[450px]">
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic mb-8">{t.chartTitle}</h2>
          <div className="flex-1 w-full">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold italic uppercase tracking-widest">{t.loading}</div>
            ) : chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic uppercase">{t.no_data}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: '800' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Legend iconType="circle" />
                  <Bar dataKey="hyrje" name={language === 'sq' ? "Hyrje" : "Stock In"} fill="#0f172a" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="dalje" name={language === 'sq' ? "Dalje" : "Stock Out"} fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
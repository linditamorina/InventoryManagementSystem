'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Receipt, Loader2, Package } from 'lucide-react';
import { useProducts } from '../../../hooks/useProducts';
import { posService } from '../../../services/posService';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Importo hook-un tënd të gjuhës
import { useLanguage } from "../../../context/LanguageContext"; 

const translations = {
  en: {
    pos: "Point of Sale",
    terminal: "Terminal",
    search: "Search product...",
    cart: "Cart",
    emptyCart: "Your cart is empty",
    total: "Total",
    checkout: "Pay Now",
    processing: "Processing...",
    success: "Sale completed successfully!",
    error: "Error during sale: ",
    items: "Items",
    invoiceTitle: "INVOICE - POS SYSTEM",
    date: "Date",
    saleId: "Sale ID",
    tableProd: "Product",
    tableQty: "Qty",
    tablePrice: "Price",
    tableSubtotal: "Subtotal",
    currency: "€",
    category: "Category",
    noProducts: "No products found."
  },
  sq: {
    pos: "Pika e Shitjes",
    terminal: "Terminali",
    search: "Kërko produktin...",
    cart: "Shporta",
    emptyCart: "Shporta juaj është boshe",
    total: "Totali",
    checkout: "Paguaj Tani",
    processing: "Duke u procesuar...",
    success: "Shitja u krye me sukses!",
    error: "Gabim gjatë shitjes: ",
    items: "Produkte",
    invoiceTitle: "FATURË - SISTEMI POS",
    date: "Data",
    saleId: "ID e Shitjes",
    tableProd: "Produkti",
    tableQty: "Sasia",
    tablePrice: "Çmimi",
    tableSubtotal: "Subtotal",
    currency: "€",
    category: "Kategoria",
    noProducts: "Asnjë produkt u gjet."
  }
};

export default function POSPage() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.sq;

  const { data: products = [], isLoading, refetch } = useProducts();
  const [cart, setCart] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const generatePDF = (saleData: any) => {
    const doc = new jsPDF() as any;
    
    // Dizajni i Faturës i përshtatur me gjuhën
    doc.setFontSize(20);
    doc.text(t.invoiceTitle, 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`${t.date}: ${new Date().toLocaleString()}`, 20, 30);
    doc.text(`${t.saleId}: ${saleData.sale.id.substring(0, 8)}`, 20, 35);

    const tableRows = saleData.items.map((item: any) => [
      item.product_name,
      item.quantity,
      `${t.currency}${item.unit_price}`,
      `${t.currency}${(item.quantity * item.unit_price).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 45,
      head: [[t.tableProd, t.tableQty, t.tablePrice, t.tableSubtotal]],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] } 
    });

    doc.text(`${t.total.toUpperCase()}: ${t.currency}${saleData.sale.total_amount.toFixed(2)}`, 140, doc.lastAutoTable.finalY + 10);
    doc.save(`Fatura_${saleData.sale.id.substring(0, 8)}.pdf`);
  };

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const payload = {
        sale: {
          total_amount: totalAmount,
          payment_method: 'CASH',
          user_id: '00000000-0000-0000-0000-000000000000' 
        },
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price
        }))
      };

      const result = await posService.createSale(payload);
      
      const pdfItems = cart.map(item => ({
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price
      }));

      generatePDF({ sale: result.sale, items: pdfItems });
      setCart([]);
      refetch();
      alert(t.success);
    } catch (error: any) {
      alert(t.error + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100-2rem)] gap-6 p-4 md:p-8 animate-in fade-in duration-700 italic font-medium">
      {/* SEKSIONI I PRODUKTEVE (MAJTAS) */}
      <div className="flex-1 space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
              {t.pos} <span className="text-red-600">{t.terminal}</span>
            </h1>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={t.search}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-600/20 font-bold transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
          {isLoading ? (
             <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase tracking-widest">{t.processing}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase tracking-widest">{t.noProducts}</div>
          ) : (
            filteredProducts.map((product: any) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:border-red-600 hover:shadow-md transition-all text-left group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 bg-red-50 text-red-600 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus size={16} strokeWidth={3} />
                </div>
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-400 group-hover:text-red-600 transition-colors">
                  <Package size={24} />
                </div>
                <h3 className="font-black text-slate-900 uppercase text-xs truncate mb-1">{product.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-3">{product.category || t.items}</p>
                <p className="text-red-600 font-black text-sm">{t.currency}{product.price.toFixed(2)}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* SHPORTA (DJATHTAS) */}
      <div className="w-full lg:w-[400px] bg-[#1a1a1a] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white/5">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-white font-black uppercase tracking-widest flex items-center gap-3">
            <ShoppingCart className="text-red-600" /> {t.cart}
          </h2>
          <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full">
            {cart.length} {t.items}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
               <Receipt size={48} strokeWidth={1} />
               <p className="font-black uppercase text-[10px] tracking-widest">{t.emptyCart}</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="bg-white/5 p-4 rounded-2xl flex items-center gap-4 group">
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-black uppercase text-[10px] truncate">{item.product.name}</h4>
                  <p className="text-red-600 font-black text-xs">{t.currency}{(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl">
                  <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 text-slate-400 hover:text-white transition-colors"><Minus size={14} /></button>
                  <span className="text-white font-black text-xs w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 text-slate-400 hover:text-white transition-colors"><Plus size={14} /></button>
                </div>
                <button onClick={() => removeFromCart(item.product.id)} className="p-2 text-slate-600 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-black/40 space-y-6">
          <div className="flex justify-between items-end">
            <span className="text-slate-500 font-black uppercase text-[10px] tracking-[0.2em]">{t.total}</span>
            <span className="text-white text-3xl font-black">{t.currency}{totalAmount.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-600/20 active:scale-95"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <><CreditCard size={18} /> {t.checkout}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
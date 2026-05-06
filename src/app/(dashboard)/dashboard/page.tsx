'use client';
import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Package, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { motion, Variants } from 'framer-motion'; 
import { useLanguage } from '../../../context/LanguageContext';

export default function DashboardPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, language } = useLanguage();

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // 1. Marrim user-in e loguar
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 2. Marrim profilin e user-it për të kuptuar nëse është admin apo staff
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, admin_id')
          .eq('id', user.id)
          .single();

        // 3. Përcaktojmë cilin ID të përdorim për të kërkuar produktet
        // Nëse është admin, përdorim ID e tij. Nëse është staff, përdorim admin_id të tij.
        let targetAdminId = user.id;
        if (profile && profile.role === 'staff' && profile.admin_id) {
          targetAdminId = profile.admin_id;
        }

        // 4. Marrim produktet bazuar tek targetAdminId
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('admin_id', targetAdminId);

        if (data && !error) setProducts(data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [supabase]);

  const statsData = useMemo(() => {
    const total = products.length;
    const low = products.filter(p => Number(p.quantity || 0) < 5).length;
    const value = products.reduce((sum, p) => sum + (Number(p.price || 0) * Number(p.quantity || 0)), 0);
    const categoryMap = products.reduce((acc: any, p) => {
      const catName = p.category ? String(p.category).toUpperCase() : (language === 'en' ? 'OTHER' : 'TJERA');
      acc[catName] = (acc[catName] || 0) + 1;
      return acc;
    }, {});
    return { 
      total, low, value, 
      areaData: Object.keys(categoryMap).map(key => ({ name: key, total: categoryMap[key] })),
      pieData: [
        { name: language === 'en' ? 'In Stock' : 'Në Gjendje', value: total - low, color: '#0f172a' },
        { name: language === 'en' ? 'Low' : 'Ulët', value: low, color: '#ef4444' },
      ].filter(d => d.value > 0 || total === 0)
    };
  }, [products, language]);

  const stats = [
    { label: t('total_items'), value: statsData.total, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('low_stock'), value: statsData.low, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: t('inventory_value'), value: `€${statsData.value.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: t('active_users'), value: 1, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 bg-[#fafafa] overflow-hidden gap-6">
      
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }}
        className="flex-shrink-0 h-8"
      >
        <h1 className="text-xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
          {t('dashboard_title')} <span className="text-red-600">{t('dashboard_overview')}</span>
        </h1>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-4 gap-4 h-24 flex-shrink-0"
      >
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 overflow-hidden relative group cursor-default"
          >
            <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:rotate-12`}>
              <stat.icon size={20} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 italic truncate">{stat.label}</p>
              <h3 className="text-xl font-black italic tracking-tighter text-slate-900 leading-none truncate">
                {isLoading ? '...' : stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="col-span-2 bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col min-h-0"
        >
          <h2 className="text-[9px] font-black text-slate-400 uppercase mb-4 tracking-widest">{t('products_by_category')}</h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statsData.areaData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: '800' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 8 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#0f172a" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col min-h-0 relative"
        >
          <h2 className="text-[9px] font-black text-slate-400 uppercase mb-4 tracking-widest text-center">{t('stock_status')}</h2>
          <div className="flex-1 w-full relative min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statsData.pieData}
                  cx="50%" cy="50%"
                  innerRadius="65%"
                  outerRadius="85%"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statsData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-[44%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-center pointer-events-none">
              <span className="block text-xl font-black italic text-slate-900 leading-none">
                {statsData.total}
              </span>
              <p className="text-[7px] font-bold text-slate-400 uppercase">Total</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
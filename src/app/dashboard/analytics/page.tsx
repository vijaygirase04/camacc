
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, IndianRupee, Calendar, 
  Download, Users, BarChart3, Activity, ChevronRight, 
  Zap, LogOut, Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

export default function AnalyticsPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [events, setEvents] = useState<any[]>([]);
  const [photoCount, setPhotoCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('events').select('*, photos(count)');
      if (data) setEvents(data);
      
      const { count } = await supabase.from('photos').select('*', { count: 'exact', head: true });
      setPhotoCount(count || 0);
    };
    fetchData();
  }, []);

  const totalEstRevenue = events.reduce((acc, e) => {
    const count = e.photos?.[0]?.count || 0;
    const price = e.pricing_rules?.per_photo || 50;
    return acc + (count * price);
  }, 0);

  const revenueData = [
    { label: 'Total Earnings', value: formatCurrency(totalEstRevenue), trend: '+18.2%', color: 'bg-primary' },
    { label: 'Avg / Event', value: events.length ? formatCurrency(Math.round(totalEstRevenue / events.length)) : formatCurrency(0), trend: '+5.4%', color: 'bg-secondary' },
    { label: 'Conversion Rate', value: '12.8%', trend: '-2.1%', color: 'bg-purple-500' },
    { label: 'Total Photos', value: photoCount.toLocaleString(), trend: `+${photoCount}`, color: 'bg-green-500' },
  ];

  const recentOrders = [
    { id: '#ORD-9921', client: 'John Doe', event: 'Wedding Raj & Sim', amount: formatCurrency(4800), date: '2 min ago', status: 'Completed' },
    { id: '#ORD-9920', client: 'Alice Smith', event: 'Corporate Gala 24', amount: formatCurrency(2400), date: '15 min ago', status: 'Completed' },
    { id: '#ORD-9919', client: 'Sarah Connor', event: 'Wedding Raj & Sim', amount: formatCurrency(9600), date: '1 hour ago', status: 'Pending' },
    { id: '#ORD-9918', client: 'Mike Ross', event: 'Tech Summit EX', amount: formatCurrency(7200), date: '3 hours ago', status: 'Completed' },
  ];

  const handleExportCSV = () => {
    const headers = ['Event ID', 'Date', 'Status', 'Photos', 'Est. Revenue'];
    const rows = events.map(e => [
      e.event_id,
      e.event_date,
      e.status,
      e.photos?.[0]?.count || 0,
      formatCurrency((e.photos?.[0]?.count || 0) * (e.pricing_rules?.per_photo || 50))
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `camacc_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const dateLabels: Record<string, string> = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days' };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex font-body pl-20">
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-surface-container-high flex flex-col items-center py-8 gap-8 z-50">
         <div 
           className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xl tracking-tighter cursor-pointer hover:scale-110 transition-transform" 
           onClick={() => router.push('/')}
           title="Home"
         >C</div>
         <div className="flex-1 flex flex-col gap-6">
            <button 
              className="p-3 text-on-surface-variant hover:bg-surface-container rounded-xl transition-all" 
              onClick={() => router.push('/dashboard')}
              title="Events"
            >
               <Calendar size={20} />
            </button>
            <button className="p-3 bg-primary/10 text-primary rounded-xl transition-all shadow-sm" title="Analytics">
               <TrendingUp size={20} />
            </button>
            <button 
              className="p-3 text-on-surface-variant hover:bg-surface-container rounded-xl transition-all"
              onClick={() => router.push('/dashboard')}
              title="Clients"
            >
               <Users size={20} />
            </button>
         </div>
         <div className="flex flex-col gap-4">
            <button 
              onClick={handleLogout}
              className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all"
              title="Logout"
            >
               <LogOut size={20} />
            </button>
         </div>
      </aside>

      <main className="flex-1 min-h-screen p-8 md:p-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
           <div>
              <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                 <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                 <ChevronRight size={14} />
                 <span className="text-on-surface font-bold">Analytics</span>
              </div>
              <h1 className="text-3xl font-bold text-on-surface font-h2">Orders & Revenue</h1>
              <p className="text-on-surface-variant">Track your marketplace performance across all events.</p>
           </div>
           
           <div className="flex items-center gap-3">
              {/* Date Range Selector */}
              <div className="flex bg-white border border-surface-container-high rounded-full overflow-hidden shadow-sm">
                {(['7d', '30d', '90d'] as const).map(range => (
                  <button 
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-2.5 text-xs font-bold transition-all ${dateRange === range ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                  >
                    {dateLabels[range]}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                 <Download size={18} />
                 Export CSV
              </button>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           {revenueData.map((stat, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="glass-panel p-8 rounded-[32px] group relative overflow-hidden"
             >
                <div className="flex items-center justify-between mb-6">
                   <div className={`p-3 rounded-2xl ${stat.color} text-white`}>
                      <IndianRupee size={24} />
                   </div>
                   <div className={`flex items-center gap-1 text-xs font-bold uppercase ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                      {stat.trend.startsWith('+') ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {stat.trend}
                   </div>
                </div>
                <p className="text-sm font-medium text-on-surface-variant mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-on-surface font-h1 tracking-tighter">{stat.value}</h3>
             </motion.div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Chart + Orders */}
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[32px] border border-surface-container-high p-8 shadow-sm">
                 <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-bold font-h2">Revenue Over Time</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-lg text-xs font-bold">
                       <Activity size={14} />
                       {dateLabels[dateRange]}
                    </div>
                 </div>
                 {/* Simple bar chart visualization */}
                 <div className="h-64 flex items-end gap-2 px-4">
                    {events.map((e, i) => {
                      const count = e.photos?.[0]?.count || 0;
                      const maxHeight = 200;
                      const height = Math.max(20, (count / Math.max(photoCount, 1)) * maxHeight);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2" title={`${e.event_id}: ${count} photos`}>
                          <span className="text-[10px] font-bold text-on-surface-variant">{count}</span>
                          <div 
                            className="w-full bg-primary/20 rounded-t-lg hover:bg-primary/40 transition-all cursor-pointer relative group"
                            style={{ height: `${height}px` }}
                          >
                            <div className="absolute inset-x-0 bottom-0 bg-primary rounded-t-lg" style={{ height: `${height * 0.7}px` }} />
                          </div>
                          <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest truncate w-full text-center">{e.event_id}</span>
                        </div>
                      );
                    })}
                    {events.length === 0 && (
                      <div className="flex-1 flex items-center justify-center text-on-surface-variant">
                        <div className="text-center">
                          <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
                          <p className="text-sm font-bold uppercase tracking-widest opacity-40">No data yet</p>
                        </div>
                      </div>
                    )}
                 </div>
              </div>

              {/* Order Table */}
              <div className="bg-white rounded-[32px] border border-surface-container-high p-8 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold font-h2">Recent Transactions</h3>
                    <button 
                      onClick={() => router.push('/dashboard')}
                      className="text-sm font-bold text-primary hover:underline"
                    >View All</button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="border-b border-surface-container-high">
                          <tr className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                             <th className="pb-4">Transaction</th>
                             <th className="pb-4">Client</th>
                             <th className="pb-4">Amount</th>
                             <th className="pb-4">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-surface-container-high">
                          {recentOrders.map((order, i) => (
                             <tr key={i} className="group hover:bg-surface-container-low/50 transition-all">
                                <td className="py-4">
                                   <p className="font-bold text-on-surface">{order.id}</p>
                                   <p className="text-[10px] text-on-surface-variant uppercase font-bold">{order.date}</p>
                                </td>
                                <td className="py-4">
                                   <p className="text-sm font-medium text-on-surface">{order.client}</p>
                                   <p className="text-[10px] text-on-surface-variant truncate max-w-[120px]">{order.event}</p>
                                </td>
                                <td className="py-4 font-bold text-on-surface">{order.amount}</td>
                                <td className="py-4">
                                   <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter ${order.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>
                                      {order.status}
                                   </span>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>

           {/* Performance Sidebar */}
           <div className="space-y-8">
              <div className="bg-white rounded-[32px] border border-surface-container-high p-8 shadow-sm h-full">
                 <h3 className="text-xl font-bold font-h2 mb-10">Sales Channels</h3>
                 
                 <div className="space-y-8">
                    <div>
                       <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-bold text-on-surface">QR Code Scans</span>
                          <span className="text-sm font-bold text-primary">64%</span>
                       </div>
                       <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[64%] rounded-full transition-all duration-1000" />
                       </div>
                    </div>
                    <div>
                       <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-bold text-on-surface">Email Links</span>
                          <span className="text-sm font-bold text-secondary">22%</span>
                       </div>
                       <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                          <div className="h-full bg-secondary w-[22%] rounded-full transition-all duration-1000" />
                       </div>
                    </div>
                    <div>
                       <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-bold text-on-surface">Direct Login</span>
                          <span className="text-sm font-bold text-purple-400">14%</span>
                       </div>
                       <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                          <div className="h-full bg-purple-400 w-[14%] rounded-full transition-all duration-1000" />
                       </div>
                    </div>
                 </div>

                 <div className="mt-16 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-3 mb-4">
                       <Zap className="text-primary" size={20} />
                       <h4 className="text-sm font-bold text-on-surface">AI Suggestion</h4>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                       Your conversion rate for "Wedding Raj & Sim" is above average. Consider offering a "Bulk Print" package to increase average order value.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}

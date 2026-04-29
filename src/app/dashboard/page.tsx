
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, MoreVertical, Calendar, Users, Eye, 
  Clock, TrendingUp, IndianRupee, Image as ImageIcon, ArrowUpRight,
  ChevronRight, Settings, Trash2, Download, Share2, LogOut, Copy, ExternalLink, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { CreateEventModal } from '@/components/dashboard/CreateEventModal';
import { UploadModal } from '@/components/dashboard/UploadModal';
import { EventDetailsModal } from '@/components/dashboard/EventDetailsModal';

export default function DashboardPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEventObj, setSelectedEventObj] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [photoStats, setPhotoStats] = useState({ total: 0, faces: 0 });

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*, photos(count)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const { count: photoCount } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true });
    
    const { count: faceCount } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .not('face_embedding', 'is', null);
    
    setPhotoStats({ total: photoCount || 0, faces: faceCount || 0 });
  };

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClick = () => { setActiveMenu(null); setShowFilterDropdown(false); };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleDeleteEvent = async (eventId: string) => {
    // First delete photos for the event
    await supabase.from('photos').delete().eq('event_id', eventId);
    // Then delete the event itself
    await supabase.from('events').delete().eq('id', eventId);
    setDeleteConfirm(null);
    setActiveMenu(null);
    fetchEvents();
    fetchStats();
  };

  const handleCopyEventId = (eventCode: string) => {
    navigator.clipboard.writeText(eventCode);
    setActiveMenu(null);
  };

  const handleShareEvent = (event: any) => {
    const shareUrl = `${window.location.origin}/event/login`;
    const text = `Access your photos!\nEvent ID: ${event.event_id}\nDate: ${event.event_date}\nLink: ${shareUrl}`;
    if (navigator.share) {
      navigator.share({ title: `Photos - ${event.event_id}`, text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Share link copied to clipboard!');
    }
    setActiveMenu(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(events.length * 450), icon: IndianRupee, trend: '+12.5%', color: 'bg-primary' },
    { label: 'Active Events', value: events.filter(e => e.status === 'active').length.toString(), icon: Calendar, trend: `+${events.length}`, color: 'bg-secondary' },
    { label: 'Total Photos', value: photoStats.total.toLocaleString(), icon: ImageIcon, trend: `+${photoStats.total}`, color: 'bg-purple-500' },
    { label: 'Client Faces', value: photoStats.faces.toLocaleString(), icon: Users, trend: `+${photoStats.faces}`, color: 'bg-orange-500' },
  ];

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.event_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || e.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-surface-container-lowest font-body">
      
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-surface-container-high flex flex-col items-center py-8 gap-8 z-50">
         <div 
           className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xl tracking-tighter cursor-pointer hover:scale-110 transition-transform"
           onClick={() => router.push('/')}
           title="Home"
         >C</div>
         <div className="flex-1 flex flex-col gap-6">
            <button 
              className="p-3 bg-primary/10 text-primary rounded-xl transition-all shadow-sm"
              title="Events"
            >
               <Calendar size={20} />
            </button>
            <button 
              onClick={() => router.push('/dashboard/analytics')}
              className="p-3 text-on-surface-variant hover:bg-surface-container rounded-xl transition-all"
              title="Analytics"
            >
               <TrendingUp size={20} />
            </button>
            <button 
              onClick={() => router.push('/dashboard/analytics')}
              className="p-3 text-on-surface-variant hover:bg-surface-container rounded-xl transition-all"
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

      <main className="pl-20 min-h-screen">
        {/* Top Navbar */}
        <header className="h-20 bg-white/60 backdrop-blur-xl border-b border-surface-container-high px-8 flex items-center justify-between sticky top-0 z-40">
           <div>
              <h1 className="text-xl font-bold text-on-surface font-h2">Photographer Hub</h1>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Welcome back, Captured Moments</p>
           </div>

           <div className="flex items-center gap-6">
              <div className="relative group hidden md:block">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={18} />
                 <input 
                    type="text" 
                    placeholder="Search events..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary w-64 text-sm transition-all"
                 />
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-full text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={18} />
                Create Event
              </button>
           </div>
        </header>

        <div className="p-8 max-w-[1440px] mx-auto">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-6 rounded-3xl group hover:border-primary/20 transition-all cursor-pointer"
                onClick={() => {
                  if (stat.label === 'Total Revenue') router.push('/dashboard/analytics');
                  if (stat.label === 'Active Events') setFilterStatus('active');
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg shadow-black/5`}>
                     <stat.icon size={24} />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100 flex items-center gap-1">
                    <ArrowUpRight size={10} />
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-on-surface-variant mb-1">{stat.label}</h3>
                <p className="text-3xl font-bold text-on-surface font-h1 tracking-tight">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Events List View */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-bold text-on-surface font-h2">Recent Events</h2>
                 {filterStatus !== 'all' && (
                   <button 
                     onClick={() => setFilterStatus('all')}
                     className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold hover:bg-primary/20 transition-all"
                   >
                     {filterStatus}
                     <X size={12} />
                   </button>
                 )}
               </div>
               <div className="flex items-center gap-2 relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowFilterDropdown(!showFilterDropdown); }}
                    className={`p-2 rounded-lg transition-all ${showFilterDropdown ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    <Filter size={18} />
                  </button>
                  <button 
                    onClick={() => router.push('/dashboard/analytics')}
                    className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all"
                    title="View Analytics"
                  >
                    <TrendingUp size={18} />
                  </button>

                  {/* Filter Dropdown */}
                  {showFilterDropdown && (
                    <div 
                      className="absolute top-10 right-0 bg-white rounded-2xl shadow-2xl border border-surface-container-high z-50 py-2 min-w-[160px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(['all', 'active', 'expired'] as const).map(status => (
                        <button
                          key={status}
                          onClick={() => { setFilterStatus(status); setShowFilterDropdown(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium capitalize transition-all ${filterStatus === status ? 'bg-primary/10 text-primary' : 'text-on-surface hover:bg-surface-container-low'}`}
                        >
                          {status === 'all' ? 'All Events' : `${status} Only`}
                        </button>
                      ))}
                    </div>
                  )}
               </div>
            </div>

            <div className="bg-white rounded-[32px] border border-surface-container-high overflow-hidden shadow-sm">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-surface-container-low border-b border-surface-container-high">
                        <th className="px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Event Details</th>
                        <th className="px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Date & Status</th>
                        <th className="px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-center">Media</th>
                        <th className="px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Earnings</th>
                        <th className="px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high">
                    {loading ? (
                      Array(3).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                           <td colSpan={5} className="px-8 py-10 h-24 bg-surface-container-low/20" />
                        </tr>
                      ))
                    ) : filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-32 text-center">
                          <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center text-outline-variant mx-auto mb-6">
                             <Calendar size={32} />
                          </div>
                          <h4 className="text-xl font-bold text-on-surface mb-1">No events found</h4>
                          <p className="text-sm text-on-surface-variant mb-6">Start by creating your first photo event.</p>
                          <button onClick={() => setIsModalOpen(true)} className="text-primary font-bold hover:underline">Create Event Now</button>
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((event) => (
                        <tr 
                          key={event.id} 
                          className="group hover:bg-surface-container-low/50 transition-all cursor-pointer"
                          onClick={() => { setSelectedEventObj(event); setIsEventDetailsOpen(true); }}
                        >
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                    <ImageIcon size={22} />
                                 </div>
                                 <div>
                                    <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{event.title || 'Untitled Event'}</p>
                                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{event.event_id}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                 <p className="text-sm font-medium text-on-surface flex items-center gap-2">
                                    <Calendar size={14} className="text-outline" />
                                    {new Date(event.event_date).toLocaleDateString()}
                                 </p>
                                 <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border w-fit uppercase tracking-tighter ${event.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                    <div className={`w-1 h-1 rounded-full ${event.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
                                    {event.status}
                                 </span>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-center">
                              <p className="text-lg font-bold text-on-surface">{event.photos?.[0]?.count || 0}</p>
                              <p className="text-[10px] text-on-surface-variant font-bold uppercase">Photos</p>
                           </td>
                           <td className="px-8 py-6">
                              <p className="text-sm font-bold text-on-surface">{formatCurrency((event.photos?.[0]?.count || 0) * (event.pricing_rules?.per_photo || 50))}</p>
                              <p className="text-[10px] text-on-surface-variant font-bold uppercase">Estimated</p>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity relative">
                                 <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEventId(event.id);
                                      setIsUploadModalOpen(true);
                                    }}
                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all" 
                                    title="Upload Photos"
                                 >
                                    <Plus size={20} />
                                 </button>
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); handleShareEvent(event); }}
                                    className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all"
                                    title="Share Event"
                                 >
                                    <Share2 size={20} />
                                 </button>
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === event.id ? null : event.id); }}
                                    className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all"
                                    title="More Options"
                                 >
                                    <MoreVertical size={20} />
                                 </button>

                                 {/* Context Menu */}
                                 {activeMenu === event.id && (
                                   <div 
                                     className="absolute top-10 right-0 bg-white rounded-2xl shadow-2xl border border-surface-container-high z-50 py-2 min-w-[200px]"
                                     onClick={(e) => e.stopPropagation()}
                                   >
                                      <button 
                                        onClick={() => handleCopyEventId(event.event_id)}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-low transition-all flex items-center gap-3"
                                      >
                                        <Copy size={16} /> Copy Event ID
                                      </button>
                                      <button 
                                        onClick={() => { window.open(`/event/${event.id}/gallery`, '_blank'); setActiveMenu(null); }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-low transition-all flex items-center gap-3"
                                      >
                                        <ExternalLink size={16} /> Preview Gallery
                                      </button>
                                      <button 
                                        onClick={() => handleShareEvent(event)}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-low transition-all flex items-center gap-3"
                                      >
                                        <Share2 size={16} /> Share with Clients
                                      </button>
                                      <button 
                                        onClick={() => { setSelectedEventObj(event); setIsEventDetailsOpen(true); setActiveMenu(null); }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-low transition-all flex items-center gap-3"
                                      >
                                        <Settings size={16} /> Manage Media
                                      </button>
                                      <div className="my-1 border-t border-surface-container-high" />
                                      {deleteConfirm === event.id ? (
                                        <div className="px-4 py-2.5">
                                          <p className="text-xs text-red-500 font-bold mb-2">Delete this event and all its photos?</p>
                                          <div className="flex gap-2">
                                            <button 
                                              onClick={() => handleDeleteEvent(event.id)}
                                              className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-all"
                                            >
                                              Yes, Delete
                                            </button>
                                            <button 
                                              onClick={() => setDeleteConfirm(null)}
                                              className="px-3 py-1.5 bg-surface-container text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container-high transition-all"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <button 
                                          onClick={() => setDeleteConfirm(event.id)}
                                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-all flex items-center gap-3"
                                        >
                                          <Trash2 size={16} /> Delete Event
                                        </button>
                                      )}
                                   </div>
                                 )}
                              </div>
                           </td>
                        </tr>
                      ))
                    )}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchEvents}
      />

      {selectedEventId && (
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedEventId(null);
          }}
          eventId={selectedEventId}
          onSuccess={() => { fetchEvents(); fetchStats(); }}
        />
      )}

      <EventDetailsModal
        isOpen={isEventDetailsOpen}
        onClose={() => {
          setIsEventDetailsOpen(false);
          setSelectedEventObj(null);
        }}
        event={selectedEventObj}
        onDelete={handleDeleteEvent}
        onOpenUpload={(eventId) => {
          setIsEventDetailsOpen(false);
          setSelectedEventId(eventId);
          setIsUploadModalOpen(true);
        }}
        onUpdate={fetchEvents}
      />
    </div>
  );
}

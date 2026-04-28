'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Image as ImageIcon, Trash2, ExternalLink, Users } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { UploadModal } from '@/components/dashboard/UploadModal';
import { supabase, getPublicUrl } from '@/lib/supabase';

export default function EventDetailPage() {
  const router = useRouter();
  const { id: eventId } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventRes, photosRes] = await Promise.all([
        supabase.from('events').select('*').eq('id', eventId).single(),
        supabase.from('photos').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
      ]);

      if (eventRes.data) setEvent(eventRes.data);
      if (photosRes.data) setPhotos(photosRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Permanent delete?')) return;
    const { error } = await supabase.from('photos').delete().eq('id', photoId);
    if (!error) fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-3 bg-white hover:bg-gray-100 rounded-2xl border border-gray-200 transition-all text-gray-400 hover:text-gray-900 shadow-sm"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-900">{event?.event_id || 'Loading...'}</h1>
              <p className="text-gray-500 font-medium">Manage this event's assets and access.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-200 active:scale-[0.98]"
            >
              <Plus size={20} />
              Add More Photos
            </button>
            <button className="p-4 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:text-indigo-600 transition-all shadow-sm">
              <ExternalLink size={24} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Photos', value: photos.length, icon: ImageIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Identified Faces', value: '...', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Gallery Visits', value: '0', icon: ExternalLink, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Est. Revenue', value: '₹0', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-gray-400 tracking-tight">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
          <div className="p-8 border-b border-gray-50">
            <h2 className="text-xl font-bold text-gray-900">Photo Catalog</h2>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {loading ? (
                Array(12).fill(0).map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-3xl animate-pulse" />
                ))
              ) : photos.length === 0 ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-50">
                  <ImageIcon size={64} className="mb-4" />
                  <p className="font-bold text-xl">No photos found</p>
                  <p>Upload some photos to get started.</p>
                </div>
              ) : (
                photos.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative aspect-square rounded-[32px] overflow-hidden border border-gray-100 bg-gray-50"
                  >
                    <img
                      src={getPublicUrl(photo.thumbnail_path || photo.storage_path)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <button 
                         onClick={() => handleDeletePhoto(photo.id)}
                         className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-xl"
                       >
                         <Trash2 size={20} />
                       </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {event && (
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            fetchData();
          }}
          eventId={event.id}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}

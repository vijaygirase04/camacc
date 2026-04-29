'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase, getPublicUrl } from '@/lib/supabase';

interface ManagePhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onUpdate?: () => void;
}

import Image from 'next/image';

interface Photo {
  id: string;
  storage_path: string;
  thumbnail_path?: string;
  [key: string]: any;
}

export const ManagePhotosModal = ({ isOpen, onClose, eventId, onUpdate }: ManagePhotosModalProps) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const fetchPhotos = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPhotos(data);
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    if (isOpen) {
      fetchPhotos();
    }
  }, [isOpen, fetchPhotos]);

  const handleDeletePhoto = async (photo: Photo) => {
    if (!window.confirm('Delete this photo?')) return;
    
    setDeletingId(photo.id);
    try {
      // Delete from storage
      await supabase.storage.from('event-photos').remove([photo.storage_path]);
      if (photo.thumbnail_path) {
        await supabase.storage.from('event-photos').remove([photo.thumbnail_path]);
      }
      
      // Delete from database
      const { error } = await supabase.from('photos').delete().eq('id', photo.id);
      if (error) throw error;
      
      setPhotos(photos.filter(p => p.id !== photo.id));
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL photos from this event? This cannot be undone.')) return;
    
    setIsDeletingAll(true);
    try {
      // 1. Get all paths
      const paths = photos.flatMap(p => [p.storage_path, p.thumbnail_path]).filter((path): path is string => Boolean(path));
      
      // 2. Delete from storage in batches
      if (paths.length > 0) {
        await supabase.storage.from('event-photos').remove(paths);
      }
      
      // 3. Delete from database
      const { error } = await supabase.from('photos').delete().eq('event_id', eventId);
      if (error) throw error;
      
      setPhotos([]);
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting all photos:', error);
      alert('Failed to delete all photos');
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 font-h2">Manage Event Photos</h2>
                <p className="text-sm text-gray-500">{photos.length} photos in this event</p>
              </div>
              <div className="flex items-center gap-4">
                {photos.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    disabled={isDeletingAll}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all text-sm"
                  >
                    {isDeletingAll ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                    Delete All
                  </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
              {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-primary" size={40} />
                  <p className="text-gray-500 font-medium">Loading photos...</p>
                </div>
              ) : photos.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">No photos found</h3>
                    <p className="text-sm text-gray-500">Upload some photos to see them here.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
                      <Image
                        src={getPublicUrl(photo.thumbnail_path || photo.storage_path)}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                        alt="Event photo"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => handleDeletePhoto(photo)}
                          disabled={deletingId === photo.id}
                          className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 hover:scale-110 transition-all shadow-lg"
                        >
                          {deletingId === photo.id ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, Clock, Trash2, Image as ImageIcon, IndianRupee, Users, CheckCircle2, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { ManagePhotosModal } from './ManagePhotosModal';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    event_id: string;
    event_date: string;
    expiry_date?: string;
    status: string;
    pricing_rules?: {
      per_photo: number;
    };
    photos?: { count: number }[];
  } | null;
  onDelete: (eventId: string) => Promise<void>;
  onOpenUpload: (eventId: string) => void;
  onUpdate?: () => void;
}

export const EventDetailsModal = ({ isOpen, onClose, event, onDelete, onOpenUpload, onUpdate }: EventDetailsModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isManagePhotosOpen, setIsManagePhotosOpen] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    event_date: '',
    price_per_photo: 50
  });

  // Reset edit data when event changes or editing starts
  React.useEffect(() => {
    if (event) {
      setEditData({
        title: event.title || '',
        event_date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : '',
        price_per_photo: event.pricing_rules?.per_photo || 50
      });
    }
  }, [event, isEditing]);

  if (!event) return null;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event and all its photos? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await onDelete(event.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert('Failed to delete event');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: editData.title,
          event_date: editData.event_date,
          pricing_rules: { ...(event.pricing_rules || {}), per_photo: Number(editData.price_per_photo) }
        })
        .eq('id', event.id);

      if (error) throw error;
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error updating event');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 font-h2">
                  {isEditing ? 'Edit Event Details' : 'Event Details'}
                </h2>
                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-all"
                    >
                      Edit
                    </button>
                  )}
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-surface-container rounded-2xl">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <ImageIcon size={32} />
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <input 
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({...editData, title: e.target.value})}
                        className="w-full text-xl font-bold bg-white border border-surface-container-high rounded-xl px-3 py-1 outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Event Title"
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-on-surface">{event.title || 'Untitled Event'}</h3>
                    )}
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium mt-1">
                      <Tag size={14} />
                      <span className="uppercase tracking-widest">{event.event_id}</span>
                      <span className="mx-2">•</span>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${event.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                        <div className={`w-1 h-1 rounded-full ${event.status === 'active' ? 'bg-green-500' : 'bg-orange-500'}`} />
                        {event.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-surface-container-high rounded-2xl">
                    <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                      <Calendar size={16} />
                      <span className="text-sm font-bold uppercase tracking-widest">Event Date</span>
                    </div>
                    {isEditing ? (
                      <input 
                        type="date"
                        value={editData.event_date}
                        onChange={(e) => setEditData({...editData, event_date: e.target.value})}
                        className="w-full bg-white border border-surface-container-high rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    ) : (
                      <p className="text-lg font-medium text-on-surface">{new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    )}
                  </div>
                  <div className="p-4 border border-surface-container-high rounded-2xl">
                    <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                      <Clock size={16} />
                      <span className="text-sm font-bold uppercase tracking-widest">Expiry Date</span>
                    </div>
                    <p className="text-lg font-medium text-on-surface">{event.expiry_date ? new Date(event.expiry_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-surface-container-high rounded-2xl">
                    <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                      <ImageIcon size={16} />
                      <span className="text-sm font-bold uppercase tracking-widest">Total Photos</span>
                    </div>
                    <p className="text-2xl font-bold text-on-surface">{event.photos?.[0]?.count || 0}</p>
                  </div>
                  <div className="p-4 border border-surface-container-high rounded-2xl">
                    <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                      <IndianRupee size={16} />
                      <span className="text-sm font-bold uppercase tracking-widest">Price Per Photo</span>
                    </div>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-on-surface">₹</span>
                        <input 
                          type="number"
                          value={editData.price_per_photo}
                          onChange={(e) => setEditData({...editData, price_per_photo: Number(e.target.value)})}
                          className="w-full bg-white border border-surface-container-high rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    ) : (
                    <p className="text-2xl font-bold text-on-surface">
                      {formatCurrency((event.photos?.[0]?.count || 0) * (event.pricing_rules?.per_photo || 50))}
                      <span className="text-sm text-on-surface-variant font-normal ml-2">({formatCurrency(event.pricing_rules?.per_photo || 50)}/ea)</span>
                    </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-surface-container-high">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting || isEditing}
                    className="flex items-center gap-2 px-6 py-3 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                    {isDeleting ? 'Deleting...' : 'Delete Event'}
                  </button>
                  <button
                    onClick={() => setIsManagePhotosOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 text-primary font-bold rounded-xl hover:bg-primary/5 transition-all"
                  >
                    <Settings size={18} />
                    Manage Photos
                  </button>
                  <div className="flex gap-4">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-3 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onOpenUpload(event.id)}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                      >
                        Upload Photos
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <ManagePhotosModal 
            isOpen={isManagePhotosOpen}
            onClose={() => setIsManagePhotosOpen(false)}
            eventId={event.id}
            onUpdate={() => {
              if (onUpdate) onUpdate();
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

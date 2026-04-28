'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateEventModal = ({ isOpen, onClose, onSuccess }: CreateEventModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    event_id: '',
    date: '',
    expiry: '30', // days
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(formData.expiry));

      const { data, error } = await supabase.from('events').insert({
        event_id: formData.event_id,
        event_date: formData.date,
        expiry_date: expiryDate.toISOString(),
        status: 'active',
        // In a real app, we'd get tenant_id from auth
        tenant_id: 'd821b952-3577-4a56-81a9-f6ac92314c5e', // Placeholder
      });

      if (error) throw error;
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error creating event');
    } finally {
      setLoading(false);
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
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event ID (Unique)</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. WEDDING-RAJ-2024"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none"
                      value={formData.event_id}
                      onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Access Expiry</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none appearance-none"
                      value={formData.expiry}
                      onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    >
                      <option value="15">15 Days</option>
                      <option value="30">30 Days</option>
                      <option value="60">60 Days</option>
                      <option value="90">90 Days</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

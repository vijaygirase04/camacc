
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Camera, Calendar, ArrowRight, Info } from 'lucide-react';

export default function EventLoginPage() {
  const [eventId, setEventId] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('id')
        .eq('event_id', eventId.trim())
        .eq('event_date', eventDate)
        .eq('status', 'active')
        .single();

      if (fetchError || !data) {
        setError('Invalid Event ID or Date. Please check your details.');
      } else {
        // Store event info in session or local storage if needed
        sessionStorage.setItem('current_event_id', data.id);
        sessionStorage.setItem('current_event_code', eventId);
        router.push(`/event/scan`);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 hero-gradient overflow-hidden">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=2074&auto=format&fit=crop" 
          alt="Photography Studio" 
          className="w-full h-full object-cover grayscale"
        />
      </div>

      <div className="absolute top-0 left-0 w-full p-8 z-10 flex justify-center md:justify-start">
        <h1 className="text-xl font-bold tracking-tighter text-primary font-h3">CamAcc</h1>
      </div>

      <main className="relative z-10 w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="glass-panel p-8 md:p-12 rounded-xl text-center">
          <div className="mb-10">
            <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20 text-white">
              <Camera size={32} />
            </div>
            <h2 className="font-h2 text-h3 text-on-surface mb-2">Access Your Gallery</h2>
            <p className="font-body text-on-surface-variant text-sm">Enter your event details to view and download your professional captures.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-xs font-medium text-on-surface-variant block ml-1" htmlFor="event-id">Event ID</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  <Info size={18} />
                </span>
                <input 
                  id="event-id"
                  type="text"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  placeholder="WED-RAJ-2024"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-on-surface placeholder:text-outline-variant text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-on-surface-variant block ml-1" htmlFor="event-date">Event Date</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  <Calendar size={18} />
                </span>
                <input 
                  id="event-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-on-surface text-sm"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center font-medium animate-pulse">{error}</p>
            )}

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-on-primary py-4 rounded-lg font-medium text-sm shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? 'Searching...' : 'Find My Photos'}
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <Info size={14} className="text-outline" />
              <p className="text-xs text-on-surface-variant">Available for 30 days after event</p>
            </div>
          </form>
        </div>

        <footer className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-on-surface-variant text-xs">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <div className="w-1 h-1 bg-outline-variant rounded-full"></div>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
            <div className="w-1 h-1 bg-outline-variant rounded-full"></div>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
          </div>
        </footer>
      </main>

      {/* Decorative Gradient Line */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-purple-400 opacity-40"></div>
    </div>
  );
}

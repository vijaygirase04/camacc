
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShoppingCart, Download, ArrowLeft, Grid, Layout, Heart, Eye, Filter, User, Share2, X, Check, RefreshCw } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { supabase, getPublicUrl } from '@/lib/supabase';
import { CartDrawer } from '@/components/gallery/CartDrawer';
import { formatCurrency, getGlobalPrice } from '@/lib/utils';

export default function GalleryPage() {
  const router = useRouter();
  const { id: eventId } = useParams();

  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'matched'>('all');
  const [matchedPhotoIds, setMatchedPhotoIds] = useState<string[]>([]);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const isExpired = eventDetails?.expiry_date && new Date() > new Date(eventDetails.expiry_date);

  useEffect(() => {
    const ids = sessionStorage.getItem('matched_photo_ids');
    if (ids) {
      setMatchedPhotoIds(JSON.parse(ids));
      setActiveFilter('matched');
    }

    const fetchEvent = async () => {
      const { data } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (data) setEventDetails(data);
    };

    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPhotos(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
    fetchPhotos();
  }, [eventId]);

  const filteredPhotos = activeFilter === 'matched' 
    ? photos.filter(p => matchedPhotoIds.includes(p.id))
    : photos;

  const toggleCart = (photo: any) => {
    if (cartItems.find(i => i.id === photo.id)) {
      setCartItems(cartItems.filter(i => i.id !== photo.id));
    } else {
      setCartItems([...cartItems, photo]);
      setIsCartOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      {/* Premium Navigation */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/60 backdrop-blur-xl border-b border-surface-container-high z-40 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.push('/event/login')}
            className="p-2.5 hover:bg-surface-container rounded-full transition-all hover:scale-110"
          >
            <ArrowLeft size={22} className="text-on-surface" />
          </button>
          <div className="hidden sm:block">
            <h1 className="font-h1 text-lg font-bold text-primary tracking-tighter">CamAcc</h1>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">{eventDetails?.title || 'Loading Event...'}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-surface-container p-1 rounded-full">
          {matchedPhotoIds.length === 0 && (
            <button 
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === 'all' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              All Photos
            </button>
          )}
          <button 
            onClick={() => setActiveFilter('matched')}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${activeFilter === 'matched' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <User size={14} />
            {matchedPhotoIds.length > 0 ? "My Photos Only" : "Scan My Face"}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
          >
            <ShoppingCart size={22} />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full text-[10px] flex items-center justify-center border-2 border-white animate-in zoom-in">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Stats */}
      <section className="pt-32 pb-8 px-6 md:px-12 max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-surface-container-high pb-8">
          <div>
            <h2 className="font-h1 text-4xl md:text-5xl font-bold text-on-surface mb-2">Memory Gallery</h2>
            <p className="text-on-surface-variant max-w-xl">
               Browse and select the moments that moved you. High-resolution digital downloads are available for instant purchase.
            </p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{photos.length}</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Total Photos</p>
            </div>
            <div className="w-px h-10 bg-surface-container-highest" />
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{matchedPhotoIds.length}</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Matches Found</p>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <main className="pb-32 px-6 md:px-12 max-w-[1440px] mx-auto w-full">
        {isExpired ? (
          <div className="py-24 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-8">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 border border-red-100">
              <Lock size={40} />
            </div>
            <h3 className="text-3xl font-bold text-on-surface mb-2 font-h2">Gallery Access Expired</h3>
            <p className="text-on-surface-variant max-w-md mx-auto leading-relaxed">
              The access period for this event has ended. Please contact the photographer if you still wish to purchase these photos.
            </p>
            <button 
              onClick={() => router.push('/event/login')}
              className="mt-8 px-8 py-3 bg-primary text-white font-bold rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="w-full aspect-[4/5] bg-surface-container rounded-2xl animate-pulse" />
            ))
          ) : filteredPhotos.length === 0 ? (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-8">
              <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center text-primary-container mb-6">
                <Filter size={40} />
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-2">No photos found</h3>
              <p className="text-on-surface-variant max-w-xs mx-auto">
                {activeFilter === 'matched' 
                  ? "We couldn't find your face in this event's photos. Try browsing 'All Photos' to find yourself manually."
                  : "This event hasn't uploaded any photos yet."}
              </p>
              {activeFilter === 'matched' && (
                <button 
                  onClick={() => setActiveFilter('all')}
                  className="mt-6 text-primary font-bold hover:underline"
                >
                  View All Event Photos
                </button>
              )}
            </div>
          ) : (
            filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 1) }}
                className="group relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer glass-panel"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={getPublicUrl(photo.thumbnail_path || photo.storage_path)}
                  alt="Personal moment"
                  className="w-full h-auto block rounded-2xl group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                
                {/* ID Tag for Matched Photos */}
                {matchedPhotoIds.includes(photo.id) && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full border border-primary/20 flex items-center gap-1.5 shadow-sm">
                    <Check size={12} className="text-green-500" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Identified</span>
                  </div>
                )}

                {/* Glass Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                       <button className="p-3 bg-white/60 hover:bg-white rounded-full transition-all text-primary">
                          <Eye size={18} />
                       </button>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCart(photo);
                      }}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl transition-all ${
                        cartItems.find(i => i.id === photo.id) 
                          ? 'bg-secondary text-white' 
                          : 'bg-primary text-white hover:bg-primary-container'
                      }`}
                    >
                      {cartItems.find(i => i.id === photo.id) ? (
                        <>
                          <Check size={18} />
                          Added
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={18} />
                          + {formatCurrency(eventDetails?.pricing_rules?.per_photo || getGlobalPrice())}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sublte Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-10 select-none">
                  <h4 className="text-2xl font-black text-white -rotate-12 border-2 border-white/40 p-2">LUMINA PREVIEW</h4>
                </div>
              </motion.div>
            ))
          )}
        </div>
        )}
      </main>

      {/* Floating Toolbar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 h-16 px-2 bg-on-surface/90 backdrop-blur-2xl rounded-full border border-white/10 flex items-center gap-1 shadow-2xl z-50">
        {matchedPhotoIds.length === 0 && (
          <button 
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${activeFilter === 'all' ? 'bg-white text-on-surface shadow-lg' : 'text-white/50 hover:text-white'}`}
            onClick={() => setActiveFilter('all')}
          >
            <Grid size={18} />
            All Event Photos
          </button>
        )}
        <button 
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${activeFilter === 'matched' ? 'bg-white text-on-surface shadow-lg' : 'text-white/50 hover:text-white'}`}
          onClick={() => {
             if (matchedPhotoIds.length > 0) setActiveFilter('matched');
             else router.push(`/event/${eventId}/scan`);
          }}
        >
          {matchedPhotoIds.length > 0 ? (
            <>
              <User size={18} />
              My Photos ({matchedPhotoIds.length})
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              Identify Me
            </>
          )}
        </button>
      </div>

      {/* Lightroom Preview Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-2xl"
              onClick={() => setSelectedPhoto(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-6xl flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden shadow-2xl h-[90vh] md:h-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Photo Area */}
              <div className="flex-grow bg-slate-900 flex items-center justify-center p-4 relative group">
                <img
                  src={getPublicUrl(selectedPhoto.storage_path)}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain shadow-2xl"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none select-none">
                   <h2 className="text-6xl font-black text-white/50 -rotate-45">PREVIEW</h2>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="w-full md:w-96 p-8 flex flex-col justify-between bg-white overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between mb-8">
                     <span className="text-xs font-bold text-primary uppercase tracking-widest px-3 py-1 bg-primary/5 rounded-full border border-primary/10">Full Resolution</span>
                     <button 
                       onClick={() => setSelectedPhoto(null)}
                       className="p-2 hover:bg-surface-container rounded-full transition-colors"
                     >
                       <X size={24} />
                     </button>
                  </div>

                  <h3 className="font-h2 text-2xl mb-4 text-on-surface">Digital Download</h3>
                  <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
                    Purchase this professional shot in its original 24MP quality. No watermarks, instant delivery to your email after checkout.
                  </p>

                  <div className="space-y-4 mb-10">
                     <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-surface-container-high">
                        <div className="flex items-center gap-3">
                           <Layout className="text-primary" size={20} />
                           <span className="text-sm font-medium">Standard License</span>
                        </div>
                        <span className="font-bold text-primary">{formatCurrency(eventDetails?.pricing_rules?.per_photo || getGlobalPrice())}</span>
                     </div>
                     <div className="flex items-center gap-2 px-2 text-[10px] text-green-600 font-bold uppercase">
                        <Check size={14} />
                        Ready for instant download
                     </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => toggleCart(selectedPhoto)}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {cartItems.find(i => i.id === selectedPhoto.id) ? (
                      <>
                        <Check size={20} />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Add to Cart — {formatCurrency(eventDetails?.pricing_rules?.per_photo || getGlobalPrice())}
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => {}}
                    className="w-full py-4 bg-surface-container text-on-surface rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-surface-container-high transition-all"
                  >
                    <Share2 size={20} />
                    Share Selection
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemove={(id) => setCartItems(cartItems.filter(i => i.id !== id))}
        pricePerPhoto={eventDetails?.pricing_rules?.per_photo || getGlobalPrice()}
      />
    </div>
  );
}

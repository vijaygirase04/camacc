
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, CreditCard, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { getPublicUrl } from '@/lib/supabase';
import { initiateCheckout } from '@/lib/payment';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  onRemove: (id: string) => void;
}

export const CartDrawer = ({ isOpen, onClose, items, onRemove }: CartDrawerProps) => {
  const [loading, setLoading] = React.useState(false);
  const total = items.length * 24; // Normalized price to $24 based on the new gallery design

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const result = await initiateCheckout(items);
      if (result.url) {
        window.open(result.url, '_blank');
      } else {
        alert('Payment initiated! (Check console for mock response)');
      }
    } catch (err) {
      alert('Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col border-l border-surface-container-high"
          >
            {/* Header */}
            <div className="p-8 border-b border-surface-container-high flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-on-surface font-h2">Your Cart</h2>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">{items.length} items selected</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-surface-container rounded-full transition-all hover:rotate-90"
              >
                <X size={24} className="text-on-surface-variant" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-8">
                  <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center text-outline-variant mb-6">
                    <ShoppingBag size={40} />
                  </div>
                  <h3 className="text-lg font-bold text-on-surface mb-2">Cart is empty</h3>
                  <p className="text-sm text-on-surface-variant">Select your favorite moments from the gallery to add them here.</p>
                  <button 
                    onClick={onClose}
                    className="mt-8 px-8 py-3 bg-primary/10 text-primary rounded-full font-bold text-sm hover:bg-primary/20 transition-all"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={item.id} 
                    className="flex gap-4 p-4 rounded-2xl border border-surface-container-high hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                  >
                    <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden glass-panel">
                       <img
                         src={getPublicUrl(item.thumbnail_path || item.storage_path)}
                         className="w-full h-full object-cover"
                         alt="Cart item"
                       />
                       <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <p className="text-xs font-bold text-primary uppercase tracking-tighter mb-1">High-Res Download</p>
                        <p className="font-bold text-on-surface line-clamp-1">Photo #{item.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <p className="text-lg font-bold text-on-surface">$24.00</p>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="p-2 text-outline hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-8 border-t border-surface-container-high bg-surface-container-low space-y-6">
                <div className="space-y-3">
                   <div className="flex items-center justify-between text-sm text-on-surface-variant">
                      <span>Subtotal ({items.length} items)</span>
                      <span>${total.toFixed(2)}</span>
                   </div>
                   <div className="flex items-center justify-between text-sm text-green-600 font-medium">
                      <span>Delivery</span>
                      <span className="flex items-center gap-1.5 uppercase text-[10px] font-bold">
                        <Zap size={12} />
                        Instant Download
                      </span>
                   </div>
                   <div className="pt-3 flex items-center justify-between">
                      <span className="text-on-surface font-bold">Total Amount</span>
                      <span className="text-3xl font-bold text-primary font-h1">${total.toFixed(2)}</span>
                   </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-4 bg-primary text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <CreditCard size={22} />}
                    Checkout Now
                  </button>
                  
                  <div className="flex items-center justify-center gap-4 py-2">
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        <ShieldCheck size={14} className="text-secondary" />
                        SSL Secured
                     </div>
                     <div className="w-1 h-1 rounded-full bg-outline-variant" />
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        256-bit Encryption
                     </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

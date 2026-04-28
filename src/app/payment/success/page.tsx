
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, ArrowRight, Share2, Mail, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background hero-gradient flex flex-col items-center justify-center p-6 font-body">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg glass-panel p-12 rounded-[40px] text-center relative overflow-hidden"
      >
        {/* Decorative background circle */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-green-500/20 scale-110 animate-bounce duration-[3000ms]">
            <CheckCircle2 size={48} />
          </div>

          <h1 className="text-4xl font-bold font-h2 text-on-surface mb-3 tracking-tight">Payment Captured</h1>
          <p className="text-on-surface-variant mb-10 leading-relaxed text-sm">
            Your high-resolution photos are now ready for download. A secure link has also been sent to your email.
          </p>

          <div className="space-y-4 mb-10">
             <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Download size={22} />
                Download All (24.5 MB)
             </button>
             <button className="w-full py-4 bg-surface-container text-on-surface rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-surface-container-high transition-all">
                <Share2 size={20} />
                Share Selection
             </button>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-6 border border-surface-container-high text-left mb-10">
             <div className="flex items-start gap-4">
                <Mail className="text-primary mt-1" size={20} />
                <div>
                   <p className="text-xs font-bold text-on-surface uppercase tracking-widest mb-1">Receipt Sent</p>
                   <p className="text-sm text-on-surface-variant">Check your inbox for <strong>#INV-2024-882</strong> and your permanent download keys.</p>
                </div>
             </div>
          </div>

          <Link 
            href="/" 
            className="text-primary font-bold hover:underline flex items-center justify-center gap-2"
          >
            Return to Home
            <ArrowRight size={18} />
          </Link>
        </div>
      </motion.div>

      <div className="mt-12 flex items-center gap-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em]">
         <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-primary" />
            Verified Purchase
         </div>
         <div className="w-1 h-1 rounded-full bg-outline-variant" />
         <div className="flex items-center gap-1.5">
            Powered by CamAcc
         </div>
      </div>
    </div>
  );
}

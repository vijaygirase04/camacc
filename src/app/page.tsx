
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Calendar, Tag, ArrowRight, Zap, Target, Shield, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LandingPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-background hero-gradient flex flex-col font-body overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="h-20 flex items-center justify-between px-8 md:px-12 fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-surface-container-high">
         <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xl tracking-tighter">C</div>
            <span className="text-xl font-bold tracking-tighter text-on-surface font-h3">CamAcc</span>
         </div>
         <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest">Pricing</Link>
            <Link href="/login" className="px-6 py-2.5 bg-primary text-white rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Photographer Login</Link>
         </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-8 relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
           <motion.div 
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
             className="flex-1 text-center lg:text-left"
           >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-6 border border-primary/10">
                 <Zap size={14} />
                 AI-Powered Photo SaaS
              </span>
              <h1 className="text-6xl md:text-7xl font-black text-on-surface font-h1 tracking-tighter leading-[1.05] mb-8">
                 Your Moments, <br />
                 <span className="text-primary italic">Instantly</span> Found.
              </h1>
              <p className="text-lg text-on-surface-variant mb-12 max-w-xl leading-relaxed">
                 The premium multi-tenant platform for photographers. Using state-of-the-art AI facial recognition to deliver personalized galleries to your clients in seconds.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                 <Link href="/event/login" className="w-full sm:w-auto px-10 py-5 bg-on-surface text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl">
                    Find My Photos
                    <ArrowRight size={20} />
                 </Link>
                 <Link href="/login" className="w-full sm:w-auto px-10 py-5 bg-white border border-surface-container-high text-on-surface rounded-2xl font-bold text-lg hover:bg-surface-container-low transition-all">
                    Register as Photographer
                 </Link>
              </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.2 }}
             className="flex-1 relative"
           >
              {/* Product Preview Stack */}
              <div className="relative glass-panel p-4 rounded-[40px] shadow-2xl scale-110">
                 <img 
                   src="https://images.unsplash.com/photo-1542038783-0addec3cdaad?q=80&w=1974&auto=format&fit=crop" 
                   className="rounded-[32px] w-full"
                   alt="App Preview"
                 />
                 <div className="absolute -bottom-10 -right-10 glass-panel p-6 rounded-3xl shadow-2xl animate-bounce duration-[4000ms]">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                          <Target size={24} />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Face Match</p>
                          <p className="text-lg font-black text-on-surface">100% Accuracy</p>
                       </div>
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-8">
           <div className="text-center mb-20">
              <h2 className="text-4xl font-bold font-h2 mb-4">Built for Modern Photographers</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">Skip the manual tagging. Let our AI do the heavy lifting while you focus on capturing the perfect shot.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Face-First Logic', desc: 'Clients upload a selfie and instantly see every photo they appear in across thousands of uploads.', icon: Target },
                { title: 'Secure Vault', desc: 'Military-grade encryption for your high-res originals. Control access with dynamic Event IDs.', icon: Shield },
                { title: 'Multi-Tenant Sales', desc: 'Each event acts as its own premium storefront with automated commerce and instant delivery.', icon: Users },
              ].map((f, i) => (
                <div key={i} className="p-10 rounded-[32px] border border-surface-container-high bg-surface-container-low/30 hover:bg-white hover:shadow-2xl hover:border-primary/20 transition-all group">
                   <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                      <f.icon size={28} />
                   </div>
                   <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                   <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-surface-container-high text-center">
         <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-black text-sm tracking-tighter">C</div>
            <span className="font-bold tracking-tighter text-on-surface">CamAcc AI</span>
         </div>
         <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-4">© 2026 CamAcc Platforms. All rights reserved.</p>
         <div className="flex items-center justify-center gap-8 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
         </div>
      </footer>
    </div>
  );
}

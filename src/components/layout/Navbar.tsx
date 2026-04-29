'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, LayoutDashboard, Settings, LogOut, IndianRupee, Tag } from 'lucide-react';
import { getGlobalPrice, setGlobalPrice } from '@/lib/utils';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
          <Camera size={24} />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          CamAcc
        </span>
      </div>

      <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
          <IndianRupee size={14} />
          <span className="font-bold">INR</span>
        </div>
        
        <div className="relative group">
          <button className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
            <Tag size={18} />
            Pricing Control
          </button>
          
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <h3 className="font-bold text-gray-900 mb-3">Global Pricing</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 block">Default Price / Photo</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold">₹</span>
                  <input 
                    type="number" 
                    defaultValue={getGlobalPrice()}
                    onChange={(e) => setGlobalPrice(Number(e.target.value))}
                    className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 italic">This will apply to all new events and gallery displays.</p>
              </div>
            </div>
          </div>
        </div>

        <Link href="/dashboard" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
        <Link href="/settings" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
          <Settings size={18} />
          Settings
        </Link>
        <button className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </nav>
  );
};

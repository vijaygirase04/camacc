'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, LayoutDashboard, Settings, LogOut } from 'lucide-react';

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

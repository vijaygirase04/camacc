'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Camera, Mail, Lock, ArrowRight, Eye, EyeOff, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function PhotographerLoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        const { error: signUpErr } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });
        if (signUpErr) {
          setError(signUpErr.message);
        } else {
          setSuccess('Account created! You can now sign in.');
          setIsSignUp(false);
          setForm({ email: form.email, password: '' });
        }
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (signInErr) {
          setError(signInErr.message);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 hero-gradient overflow-hidden font-body">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1554048612-608cb0b0a78e?q=80&w=2070&auto=format&fit=crop"
          alt="Studio"
          className="w-full h-full object-cover grayscale"
        />
      </div>

      {/* Logo */}
      <div className="absolute top-0 left-0 w-full p-8 z-10 flex justify-center md:justify-start">
        <Link href="/" className="text-xl font-bold tracking-tighter text-primary font-h3">CamAcc</Link>
      </div>

      <main className="relative z-10 w-full max-w-[440px]">
        <div className="glass-panel p-8 md:p-12 rounded-xl text-center">
          {/* Header */}
          <div className="mb-10">
            <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20 text-white">
              <Camera size={32} />
            </div>
            <h2 className="font-h2 text-2xl text-on-surface mb-2">
              {isSignUp ? 'Create Account' : 'Photographer Login'}
            </h2>
            <p className="font-body text-on-surface-variant text-sm">
              {isSignUp
                ? 'Set up your studio account to start uploading events.'
                : 'Sign in to manage your events, uploads, and revenue.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-on-surface-variant block ml-1" htmlFor="email">Email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@studio.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-on-surface placeholder:text-outline-variant text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-on-surface-variant block ml-1" htmlFor="password">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3.5 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-on-surface placeholder:text-outline-variant text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            {success && (
              <p className="text-green-600 text-xs text-center font-medium bg-green-50 px-3 py-2 rounded-lg">{success}</p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary py-4 rounded-lg font-medium text-sm shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading
                  ? 'Please wait...'
                  : isSignUp
                    ? 'Create Account'
                    : 'Sign In'}
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
                className="text-sm text-primary hover:underline font-medium flex items-center justify-center gap-1.5 mx-auto"
              >
                <UserPlus size={14} />
                {isSignUp ? 'Already have an account? Sign In' : 'New here? Create an account'}
              </button>
            </div>
          </form>
        </div>

        <footer className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-on-surface-variant text-xs">
            <Link href="/event/login" className="hover:text-primary transition-colors">Client Access →</Link>
            <div className="w-1 h-1 bg-outline-variant rounded-full" />
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </footer>
      </main>

      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-purple-400 opacity-40" />
    </div>
  );
}

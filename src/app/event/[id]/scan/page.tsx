'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useCamera } from '@/hooks/useCamera';
import { loadModels, getFaceEmbedding } from '@/lib/face-api';
import { supabase } from '@/lib/supabase';

export default function FaceScanPage() {
  const router = useRouter();
  const { id: eventId } = useParams();
  const { videoRef, startCamera, stopCamera, error: cameraError } = useCamera();
  const [status, setStatus] = useState<'loading' | 'scanning' | 'matching' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [matchResult, setMatchResult] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await loadModels();
        await startCamera();
        setStatus('scanning');
      } catch (err) {
        setStatus('error');
        setErrorMsg('Failed to initialize face recognition models.');
      }
    };
    init();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleScan = async () => {
    if (!videoRef.current) return;
    setStatus('matching');

    try {
      const embedding = await getFaceEmbedding(videoRef.current);
      
      if (!embedding) {
        setStatus('scanning');
        alert('No face detected. Please position your face clearly in the frame.');
        return;
      }

      // Convert Float32Array to number[] for Supabase
      const embeddingArray = Array.from(embedding);

      const { data: matches, error } = await supabase.rpc('match_faces', {
        query_embedding: `[${embeddingArray.join(',')}]`,
        match_threshold: 0.6, // Adjust threshold as needed
        match_count: 1,
        target_event_id: eventId,
      });

      if (error) throw error;

      if (matches && matches.length > 0) {
        setMatchResult(matches[0]);
        setStatus('success');
        // Wait a bit then redirect to gallery
        setTimeout(() => {
          router.push(`/event/${eventId}/gallery?face_id=${matches[0].face_id}`);
        }, 2000);
      } else {
        setStatus('error');
        setErrorMsg('No match found for this event. Have you been photographed yet?');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg('An error occurred during face recognition.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      <AnimatePresence mode="wait">
        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 font-medium">Loading AI Models...</p>
          </motion.div>
        )}

        {(status === 'scanning' || status === 'matching') && (
          <motion.div
            key="scanner"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md flex flex-col items-center"
          >
            <div className="relative w-full aspect-square bg-slate-900 rounded-[40px] overflow-hidden border-2 border-white/10 shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover grayscale-[0.2]"
              />
              
              {/* Scanner Frame */}
              <div className="absolute inset-0 border-[40px] border-slate-950/40 pointer-events-none">
                <div className="w-full h-full border-2 border-dashed border-indigo-500/50 rounded-3xl" />
              </div>

              {/* Scan Animation */}
              <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.8)] z-20"
              />

              {status === 'matching' && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-30">
                  <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="animate-spin text-indigo-400" size={48} />
                    <p className="font-bold text-lg">Finding Your Photos...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 text-center space-y-6 w-full">
              <div>
                <h2 className="text-2xl font-black mb-2">Verification Scan</h2>
                <p className="text-gray-400">Position your face in the frame and look straight into the camera.</p>
              </div>

              <button
                onClick={handleScan}
                disabled={status === 'matching'}
                className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black text-xl hover:bg-gray-100 transition-all active:scale-[0.98] shadow-2xl flex items-center justify-center gap-3"
              >
                <Camera size={24} />
                Scan My Face
              </button>
            </div>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 size={64} />
            </div>
            <div>
              <h2 className="text-3xl font-black mb-2">Face Recognized!</h2>
              <p className="text-gray-400 text-lg">We found your photos. Redirecting to your personal gallery...</p>
            </div>
            <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                 {(matchResult.similarity * 100).toFixed(0)}%
               </div>
               <div className="text-left">
                 <p className="text-xs uppercase font-bold text-gray-500 tracking-widest">Match Score</p>
                 <p className="font-bold">Highly Accurate</p>
               </div>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center space-y-8 max-w-sm"
          >
            <div className="w-24 h-24 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center">
              <AlertCircle size={64} />
            </div>
            <div>
              <h2 className="text-2xl font-black mb-2">No Match Found</h2>
              <p className="text-gray-400">{errorMsg}</p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => setStatus('scanning')}
                className="w-full bg-indigo-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
              >
                <RefreshCw size={20} />
                Try Again
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
              >
                <X size={20} />
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

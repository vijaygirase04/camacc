
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CheckCircle2, RefreshCw, Image as ImageIcon, ShieldCheck, Zap, ArrowRight, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { loadModels, getMultiFaceEmbeddings } from '@/lib/face-api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSuccess: () => void;
}

export const UploadModal = ({ isOpen, onClose, eventId, onSuccess }: UploadModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const processUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setStatus('Initializing AI Models...');
    
    try {
      await loadModels();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setStatus(`Analyzing Faces: ${file.name}...`);

        // 1. Detect faces and get embeddings
        const img = await new Promise<HTMLImageElement>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        });

        const embeddings = await getMultiFaceEmbeddings(img);
        
        // 2. Upload to storage
        const filePath = `${eventId}/${Date.now()}-${file.name}`;
        const { error: storageError } = await supabase.storage
          .from('event-photos')
          .upload(filePath, file);

        if (storageError) throw storageError;

        // 3. Save to photos table
        const { data: photoData, error: photoError } = await supabase
          .from('photos')
          .insert({
            event_id: eventId,
            storage_path: filePath,
            metadata: { faces_count: embeddings.length }
          })
          .select()
          .single();

        if (photoError) throw photoError;

        // 4. Save faces and map them
        for (const embedding of embeddings) {
          const embeddingArray = Array.from(embedding);
          const { data: faceData, error: faceError } = await supabase
            .from('faces')
            .insert({
              event_id: eventId,
              embedding: `[${embeddingArray.join(',')}]`
            })
            .select()
            .single();

          if (faceError) throw faceError;

          await supabase.from('photo_face_map').insert({
            photo_id: photoData.id,
            face_id: faceData.id
          });
        }
        
        const step = ((i + 1) / files.length) * 100;
        setProgress(step);
      }

      setStatus('All Photos Processed!');
      setIsComplete(true);
      onSuccess();
    } catch (err) {
      console.error(err);
      setStatus('Error during upload');
    } finally {
      setUploading(false);
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
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-md"
            onClick={!uploading && !isComplete ? onClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden glass-panel"
          >
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-primary/10 rounded-xl text-primary">
                      <ImageIcon size={24} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold text-on-surface font-h2">Media Upload</h2>
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">AI Face Tagging Enabled</p>
                   </div>
                </div>
                {!uploading && !isComplete && (
                  <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-all">
                    <X size={24} />
                  </button>
                )}
              </div>

              {!uploading && !isComplete ? (
                <div className="space-y-8">
                  <div 
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="border-2 border-dashed border-surface-container-highest rounded-[32px] p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all group"
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <p className="text-lg font-bold text-on-surface">Choose Media Files</p>
                    <p className="text-sm text-on-surface-variant mt-2 text-center">Drag and drop photos here. We support JPG, PNG and RAW formats.</p>
                    <input 
                      id="file-upload" 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="bg-surface-container-low rounded-2xl p-6 border border-surface-container-high">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-surface-container-high">
                        <span className="text-sm font-bold text-on-surface">{files.length} Files Queued</span>
                        <button 
                          onClick={() => setFiles([])}
                          className="text-primary text-xs font-bold hover:underline uppercase tracking-widest"
                        >
                          Clear Selection
                        </button>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {files.map((file, i) => (
                          <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-surface-container-high shadow-sm">
                             <div className="flex items-center gap-3">
                                <FileText size={18} className="text-outline" />
                                <span className="text-xs font-medium text-on-surface truncate max-w-[200px]">{file.name}</span>
                             </div>
                             <span className="text-[10px] font-bold text-on-surface-variant">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    <button
                      disabled={files.length === 0}
                      onClick={processUpload}
                      className="w-full py-4 bg-primary text-white font-bold text-base rounded-2xl transition-all shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      Start AI Processing
                    </button>
                    <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                       <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-green-500" /> Secure Storage</span>
                       <div className="w-1 h-1 rounded-full bg-outline-variant" />
                       <span className="flex items-center gap-1"><Zap size={12} className="text-primary" /> Instant AI Matching</span>
                    </div>
                  </div>
                </div>
              ) : isComplete ? (
                <div className="py-12 flex flex-col items-center text-center animate-in fade-in zoom-in-95">
                   <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-8 border border-green-100 shadow-lg shadow-green-500/10 scale-125">
                      <CheckCircle2 size={48} />
                   </div>
                   <h3 className="text-3xl font-bold text-on-surface font-h2 mb-2">Upload Successful</h3>
                   <p className="text-on-surface-variant mb-10 max-w-sm">
                     All {files.length} photos have been uploaded and facial recognition data has been indexed for clients.
                   </p>
                   <div className="flex gap-4 w-full">
                      <button 
                        onClick={onClose}
                        className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                         Go to Dashboard
                         <ArrowRight size={18} />
                      </button>
                   </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="relative w-40 h-40 mb-10">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        className="text-surface-container-high stroke-current"
                        strokeWidth="6"
                        cx="50"
                        cy="50"
                        r="44"
                        fill="transparent"
                      />
                      <motion.circle
                        className="text-primary stroke-current"
                        strokeWidth="6"
                        strokeLinecap="round"
                        cx="50"
                        cy="50"
                        r="44"
                        fill="transparent"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: progress / 100 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-bold text-on-surface font-h1">{Math.round(progress)}%</span>
                       <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">AI Scan</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                     <RefreshCw size={20} className="text-primary animate-spin" />
                     <h3 className="text-xl font-bold text-on-surface">{status}</h3>
                  </div>
                  <p className="text-sm text-on-surface-variant max-w-xs mx-auto">
                    We&apos;re currently extracting facial embeddings to automate client gallery delivery.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

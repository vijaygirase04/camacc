
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { loadModels, getFaceEmbedding } from '@/lib/face-api';
import { Camera, User, RefreshCw, AlertCircle, CheckCircle2, ChevronLeft, Upload, Info } from 'lucide-react';

export default function FaceScanPage() {
  const [isAiLoaded, setIsAiLoaded] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'matched' | 'error'>('idle');
  const [errorHeader, setErrorHeader] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [useUploadMode, setUseUploadMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        await loadModels();
        setIsAiLoaded(true);
      } catch (err) {
        console.error('AI Loading Error:', err);
        setStatus('error');
        setErrorHeader('AI Error');
        setErrorMessage('Failed to load recognition models. Please check your connection.');
        return;
      }

      // Start camera after models load
      await startCamera();
    };
    init();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setUseUploadMode(true);
      return;
    }

    try {
      // Try with ideal constraints first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraReady(true);
        };
      }
    } catch (firstErr) {
      console.warn('Camera first attempt failed, trying simpler constraints:', firstErr);
      try {
        // Fallback: simplest possible constraint
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsCameraReady(true);
          };
        }
      } catch (err: any) {
        console.error('Camera Error:', err);
        // Don't show error — switch to upload mode instead
        setUseUploadMode(true);
      }
    }
  };


  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const processEmbedding = async (descriptor: Float32Array) => {
    // Match against Supabase
    const eventId = sessionStorage.getItem('current_event_id');
    if (!eventId) {
      router.push('/event/login');
      return;
    }

    const { data, error } = await supabase.rpc('match_faces', {
      query_embedding: `[${Array.from(descriptor).join(',')}]`,
      match_threshold: 0.4,
      match_count: 50,
      target_event_id: eventId
    });

    if (error) {
      console.error('RPC Error:', error);
      setStatus('error');
      setErrorHeader('Match Error');
      setErrorMessage(error.message || 'Something went wrong during matching.');
    } else if (!data || data.length === 0) {
      setStatus('error');
      setErrorHeader('No Match Found');
      setErrorMessage('We couldn\'t find any photos associated with your face at this event. Try adjusting your position and scanning again.');
    } else {
      setStatus('matched');
      // Store matched photo IDs (deduplicated) from the RPC join
      const photoIds = [...new Set(data.map((p: any) => p.photo_id))];
      sessionStorage.setItem('matched_photo_ids', JSON.stringify(photoIds));
      setTimeout(() => {
        router.push(`/event/${eventId}/gallery`);
      }, 1500);
    }
  };

  const captureAndMatch = async () => {
    if (!isAiLoaded || !videoRef.current) return;

    setStatus('scanning');
    setIsScanning(true);

    try {
      const video = videoRef.current;
      
      // Wait for video to be ready
      if (video.readyState < 2) {
        await new Promise<void>((resolve) => {
          video.addEventListener('loadeddata', () => resolve(), { once: true });
          setTimeout(resolve, 2000); // fallback timeout
        });
      }

      // Draw video frame to an offscreen canvas (bypasses CSS filters)
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context failed');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Retry face detection up to 3 times with small delays
      let descriptor = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        descriptor = await getFaceEmbedding(canvas);
        if (descriptor) break;
        // Wait a moment and re-capture
        await new Promise(r => setTimeout(r, 500));
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      if (!descriptor) {
        setStatus('error');
        setErrorHeader('Face Not Detected');
        setErrorMessage('We couldn\'t find your face in the frame. Make sure your face is well-lit, centered in the circle, and try again.');
        setIsScanning(false);
        return;
      }

      await processEmbedding(descriptor);

    } catch (err) {
      console.error('Matching Error:', err);
      setStatus('error');
      setErrorHeader('Error Occurred');
      setErrorMessage('Something went wrong during the scan. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isAiLoaded) return;

    setStatus('scanning');
    setIsScanning(true);

    try {
      // 1. Convert file to image
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = ev.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 2. Extract embedding
      const descriptor = await getFaceEmbedding(img);

      if (!descriptor) {
        setStatus('error');
        setErrorHeader('Face Not Detected');
        setErrorMessage('We couldn\'t find a face in that photo. Make sure your face is clearly visible, well-lit, and try another photo.');
        setIsScanning(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      await processEmbedding(descriptor);

    } catch (err) {
      console.error('Upload Matching Error:', err);
      setStatus('error');
      setErrorHeader('Error Occurred');
      setErrorMessage('Something went wrong processing your photo. Please try again.');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background hero-gradient flex flex-col items-center justify-center p-6 text-on-surface">
      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Hidden File Input for fallback mode */}
        <input 
          type="file" 
          accept="image/*" 
          capture="user"
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileUpload}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.push('/event/login')}
            className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <div className="text-right">
            <h1 className="text-sm font-bold tracking-tighter text-primary font-h3">CamAcc</h1>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Face Scan</p>
          </div>
        </div>

        <div className="glass-panel overflow-hidden rounded-2xl relative">
          
          {/* Main Viewport */}
          <div className="aspect-[4/3] bg-black relative flex items-center justify-center">
            
            {useUploadMode ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary group hover:bg-primary hover:text-white transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                     <Upload size={32} />
                  </div>
                  <p className="text-white/80 max-w-xs text-sm">
                     Please upload a clear photo of your face directly from your gallery to match your photos.
                  </p>
               </div>
            ) : (
                <>
                    {/* The circular target mask */}
                    <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                    <div className="w-[280px] h-[280px] rounded-full border-2 border-primary/30 shadow-[0_0_0_1000px_rgba(24,24,36,0.6)] relative">
                        {/* Pulsing Scan Line */}
                        {isScanning && (
                            <div className="absolute left-0 top-0 w-full h-1 bg-primary/80 shadow-[0_0_15px_#3525cd] animate-[scan_2s_infinite]" />
                        )}
                        {/* Corner Markers */}
                        <div className="absolute -left-1 -top-1 w-6 h-6 border-l-2 border-t-2 border-primary rounded-tl-xl" />
                        <div className="absolute -right-1 -top-1 w-6 h-6 border-r-2 border-t-2 border-primary rounded-tr-xl" />
                        <div className="absolute -left-1 -bottom-1 w-6 h-6 border-l-2 border-b-2 border-primary rounded-bl-xl" />
                        <div className="absolute -right-1 -bottom-1 w-6 h-6 border-r-2 border-b-2 border-primary rounded-br-xl" />
                    </div>
                    </div>

                    {/* Video Feed */}
                    <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                    />
                </>
            )}

            {/* AI Loading State */}
            {!isAiLoaded && status !== 'error' && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
                <RefreshCw size={48} className="text-primary animate-spin mb-4" />
                <p className="font-medium">Initializing AI Engine...</p>
                <p className="text-xs text-on-surface-variant mt-2">Loading facial recognition models</p>
              </div>
            )}

            {/* Success Overlay */}
            {status === 'matched' && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-primary/10 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-full p-6 shadow-xl shadow-primary/20 text-green-500 scale-125">
                   <CheckCircle2 size={64} />
                </div>
                <h3 className="text-2xl font-bold mt-8 text-white drop-shadow-md">Identity Verified</h3>
                <p className="text-white/80">Opening your personalized gallery...</p>
              </div>
            )}
          </div>

          {/* Controls Area */}
          <div className="p-8 text-center bg-white/40 backdrop-blur-sm">
            {status === 'error' ? (
              <div className="animate-in slide-in-from-top-2">
                <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
                  <AlertCircle size={20} />
                  <h4 className="font-bold">{errorHeader}</h4>
                </div>
                <p className="text-sm text-on-surface-variant mb-6">{errorMessage}</p>
                <button 
                  onClick={() => { 
                    setStatus('idle'); 
                    if (!useUploadMode) { startCamera(); } else { fileInputRef.current?.click(); } 
                  }}
                  className="bg-primary text-on-primary px-8 py-3 rounded-full font-medium text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  Try Again
                </button>
              </div>
            ) : status === 'matched' ? (
              <div className="flex items-center justify-center gap-3">
                 <RefreshCw className="animate-spin text-primary" size={20} />
                 <span className="font-medium">Redirecting...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <h3 className="font-h2 text-xl mb-2">{useUploadMode ? 'Upload Selfie' : 'Verification Scan'}</h3>
                <p className="text-sm text-on-surface-variant mb-8 max-w-sm mx-auto">
                  {useUploadMode ? 'Upload a clear selfie directly to find your photos.' : 'Center your face within the circle and click the button below to find your photos.'}
                </p>
                
                <div className="flex items-center gap-4">
                  {useUploadMode ? (
                      <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!isAiLoaded || isScanning}
                      className="bg-primary text-on-primary px-12 py-4 rounded-full font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30 flex items-center gap-3 disabled:opacity-50"
                    >
                      {isScanning ? 'Processing...' : 'Upload Photo'}
                      <Upload size={20} />
                    </button>
                  ) : (
                    <>
                        <button 
                            onClick={captureAndMatch}
                            disabled={!isAiLoaded || isScanning || !isCameraReady}
                            className="bg-primary text-on-primary px-12 py-4 rounded-full font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30 flex items-center gap-3 disabled:opacity-50"
                        >
                            {isScanning ? 'Processing...' : 'Start Face Scan'}
                            <Camera size={20} />
                        </button>
                        
                        {/* Upload Fallback Toggle */}
                        <button 
                            onClick={() => { setUseUploadMode(true); stopCamera(); }}
                            title="Upload a photo instead"
                            className="p-4 rounded-full bg-white text-on-surface hover:text-primary shadow-md hover:bg-surface-container transition-colors"
                        >
                            <Upload size={24} />
                        </button>
                    </>
                  )}
                  
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
          <Info className="text-primary shrink-0 mt-0.5" size={20} />
          <div>
            <h5 className="text-sm font-bold text-primary mb-1">Privacy Focused AI</h5>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Our AI scan generates a temporary mathematical representation of your face for matching purposes only. Your facial geometry is never stored as an image or shared with third parties.
            </p>
          </div>
        </div>
      </div>

      {/* Animation Definitions */}
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

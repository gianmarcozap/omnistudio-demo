import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Camera, 
  RefreshCw, 
  Video, 
  Sparkles, 
  Check
} from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import type { CaptureAngle } from '../types';
import { playCountdownBeep, playShutterSound } from '../utils/audio';

const ANGLES_CONFIG: { id: CaptureAngle; label: string; short: string; tip: string }[] = [
  { id: 'frontal', label: 'Imagen 1: Frontal', short: 'Frontal', tip: 'Prenda centrada sobre fondo neutro' },
  { id: 'posterior', label: 'Imagen 2: Posterior', short: 'Posterior', tip: 'Vista dorsal y detalles de espalda' },
  { id: 'detalle', label: 'Imagen 3: Detalle / Textura', short: 'Detalle', tip: 'Macro de tejido, cremalleras o costuras' },
  { id: 'etiqueta', label: 'Imagen 4: Etiqueta / Composición', short: 'Etiqueta', tip: 'Legibilidad de marca, cuidados y talla' },
];

export const StudioCamera: React.FC = () => {
  const { 
    selectedCaptureAngle, 
    setCaptureAngle, 
    setPhoto, 
    currentForm, 
    loadStudioPresets,
    triggerShutterFlash,
    isFlashing
  } = useCatalogStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string | null>(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Initialize camera
  const startCamera = useCallback(async () => {
    setCameraErrorMsg(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador no soporta API de cámara');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'environment',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setHasCameraAccess(true);
    } catch (err: unknown) {
      console.warn('Camera access denied or unavailable:', err);
      const errMsg = err instanceof Error ? err.message : 'No se pudo conectar a la cámara web';
      setHasCameraAccess(false);
      setCameraErrorMsg(errMsg);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  // Shutter action
  const takeSnapshot = () => {
    if (isCountingDown) return;

    setIsCountingDown(true);
    setCountdown(3);
    playCountdownBeep(false);

    let currentCount = 3;
    const timer = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
        playCountdownBeep(false);
      } else {
        clearInterval(timer);
        setIsCountingDown(false);
        playCountdownBeep(true);
        triggerShutterFlash();
        playShutterSound();
        performCapture();
      }
    }, 1000);
  };

  const performCapture = () => {
    let capturedDataUrl: string | null = null;

    if (hasCameraAccess && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        capturedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      }
    }

    // Fallback if camera stream is simulated or failed
    if (!capturedDataUrl) {
      // Pick matching high-res photo from studio assets
      const samplePhotos: Record<CaptureAngle, string> = {
        frontal: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
        posterior: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=85',
        detalle: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1200&q=85',
        etiqueta: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=85',
      };
      capturedDataUrl = samplePhotos[selectedCaptureAngle];
    }

    if (capturedDataUrl) {
      setPhoto(selectedCaptureAngle, capturedDataUrl);

      // Auto advance to next angle for high-throughput station workflow
      const angles: CaptureAngle[] = ['frontal', 'posterior', 'detalle', 'etiqueta'];
      const currentIndex = angles.indexOf(selectedCaptureAngle);
      const nextAngle = angles[(currentIndex + 1) % angles.length];
      setCaptureAngle(nextAngle);
    }
  };

  const activeAngleConfig = ANGLES_CONFIG.find(a => a.id === selectedCaptureAngle) || ANGLES_CONFIG[0];
  const currentAnglePhoto = currentForm.photos[selectedCaptureAngle];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 space-y-3 relative overflow-hidden">
      
      {/* Header of Studio Box */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Estudio Fotográfico en Vivo
          </h3>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {hasCameraAccess ? 'WebCam HD' : 'Preset Studio Engine'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={loadStudioPresets}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200/80 transition-colors"
            title="Pre-cargar las 4 fotografías profesionales de estudio en un clic"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Cargar Muestras de Estudio</span>
          </button>
        </div>
      </div>

      {/* Angle Selector Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
        {ANGLES_CONFIG.map((angle) => {
          const isCaptured = !!currentForm.photos[angle.id];
          const isSelected = selectedCaptureAngle === angle.id;

          return (
            <button
              key={angle.id}
              onClick={() => setCaptureAngle(angle.id)}
              className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1 text-[11px] transition-all ${
                isSelected
                  ? 'bg-white text-indigo-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className="truncate">{angle.short}</span>
              {isCaptured && (
                <Check className="w-3 h-3 text-emerald-600 stroke-[3] shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Video Viewport / Viewfinder */}
      <div className="relative aspect-[16/10] bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center group select-none">
        
        {/* Real Video Stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            hasCameraAccess ? 'opacity-100' : 'hidden'
          }`}
        />

        {/* Fallback Viewport when no webcam access */}
        {!hasCameraAccess && (
          <div className="w-full h-full relative flex flex-col items-center justify-center bg-slate-900 text-slate-300 p-4">
            {/* Background Studio Visual */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 filter grayscale contrast-125"
              style={{
                backgroundImage: `url(${currentAnglePhoto || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80'})`
              }}
            />

            <div className="relative z-10 text-center space-y-2 max-w-xs">
              <div className="w-10 h-10 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center mx-auto text-amber-400">
                <Video className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-white">
                Simulador de Estudio Fotográfico
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {cameraErrorMsg ? `Permiso no otorgado o sin cámara web física.` : 'Modo estudio calibrado activo.'}
                {' '}El obturador capturará tomas de estudio de alta resolución.
              </p>
              <div className="pt-1 flex items-center justify-center gap-2">
                <button
                  onClick={startCamera}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reintentar Cámara
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Viewfinder Crosshair Overlays & Framing Guides */}
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3.5 bg-crosshair-pattern">
          
          {/* Top HUD */}
          <div className="flex items-center justify-between text-[10px] font-mono text-white/80 drop-shadow">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE 1080p · 5600K</span>
            </div>
            <div className="bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded border border-white/10">
              ISO 100 · 1/125s · f/4.0
            </div>
          </div>

          {/* Center Crosshair & Framing Brackets */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Center Crosshair */}
            <div className="relative w-12 h-12">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/40" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/40" />
              <div className="absolute inset-2 border border-white/30 rounded-full" />
            </div>

            {/* Framing Box */}
            <div className="absolute w-3/4 h-3/4 border border-dashed border-white/20 rounded-lg pointer-events-none">
              {/* Corner Brackets */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white/80" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white/80" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white/80" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white/80" />
            </div>
          </div>

          {/* Bottom HUD */}
          <div className="flex items-center justify-between text-[10px] font-mono text-white/90 drop-shadow">
            <div className="bg-indigo-600/90 text-white px-2 py-0.5 rounded font-semibold tracking-wide flex items-center gap-1 border border-indigo-400/40">
              <Camera className="w-3 h-3" />
              <span>{activeAngleConfig.label}</span>
            </div>
            <div className="text-white/60 bg-black/40 px-2 py-0.5 rounded text-[10px]">
              {activeAngleConfig.tip}
            </div>
          </div>
        </div>

        {/* Countdown Overlay */}
        {isCountingDown && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-30 animate-in fade-in duration-200">
            <div className="text-7xl font-mono font-black text-white drop-shadow-lg scale-125 animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* Shutter Flash Effect */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-40 animate-shutter pointer-events-none" />
        )}
      </div>

      {/* Hidden Canvas for High-Res Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Shutter Button & Angle Tip */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={takeSnapshot}
          disabled={isCountingDown}
          className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          <Camera className="w-4 h-4 stroke-[2.5]" />
          <span>📸 Tomar Foto (Shutter)</span>
          {isCountingDown && <span className="font-mono font-bold">({countdown})</span>}
        </button>
      </div>
    </div>
  );
};

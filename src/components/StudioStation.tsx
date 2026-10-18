import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Camera, 
  RefreshCw, 
  Video, 
  Sparkles, 
  Check, 
  Maximize2, 
  RotateCcw, 
  Trash2, 
  Upload, 
  CheckCircle2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import type { CaptureAngle } from '../types';
import { playCountdownBeep, playShutterSound } from '../utils/audio';

const ANGLES_CONFIG: { id: CaptureAngle; label: string; short: string; number: string; tip: string }[] = [
  { id: 'frontal', label: 'Imagen 1: Frontal', short: 'Frontal', number: '01', tip: 'Prenda centrada sobre fondo neutro' },
  { id: 'posterior', label: 'Imagen 2: Posterior', short: 'Posterior', number: '02', tip: 'Vista dorsal y detalles de espalda' },
  { id: 'detalle', label: 'Imagen 3: Detalle / Textura', short: 'Detalle', number: '03', tip: 'Macro de tejido o costuras' },
  { id: 'etiqueta', label: 'Imagen 4: Etiqueta / Composición', short: 'Etiqueta', number: '04', tip: 'Legibilidad de marca y talla' },
];

export const StudioStation: React.FC = () => {
  const { 
    selectedCaptureAngle, 
    setCaptureAngle, 
    setPhoto, 
    removePhoto,
    currentForm, 
    loadStudioPresets,
    triggerShutterFlash,
    isFlashing,
    openModal
  } = useCatalogStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRefs = useRef<Record<CaptureAngle, HTMLInputElement | null>>({
    frontal: null,
    posterior: null,
    detalle: null,
    etiqueta: null,
  });

  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string | null>(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isViewfinderCollapsed, setIsViewfinderCollapsed] = useState(false);

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

  const handleFileUpload = (angle: CaptureAngle, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhoto(angle, event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const activeAngleConfig = ANGLES_CONFIG.find(a => a.id === selectedCaptureAngle) || ANGLES_CONFIG[0];
  const currentAnglePhoto = currentForm.photos[selectedCaptureAngle];
  const capturedCount = Object.values(currentForm.photos).filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 space-y-3 select-none">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Estudio Fotográfico en Vivo
          </h3>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {hasCameraAccess ? 'WebCam HD' : 'Preset Studio'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={loadStudioPresets}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200/80 transition-colors"
            title="Pre-cargar las 4 fotografías profesionales de estudio en un clic"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Cargar Muestras</span>
            <span className="sm:hidden">Muestras</span>
          </button>

          <button
            onClick={() => setIsViewfinderCollapsed(!isViewfinderCollapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={isViewfinderCollapsed ? 'Expandir visor de cámara' : 'Minimizar visor de cámara'}
          >
            {isViewfinderCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Camera Viewfinder Box (Collapsible) */}
      {!isViewfinderCollapsed && (
        <div className="space-y-2">
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

          {/* Viewfinder Display */}
          <div className="relative h-44 sm:h-48 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center group">
            
            {/* Real Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                hasCameraAccess ? 'opacity-100' : 'hidden'
              }`}
            />

            {/* Simulated / Fallback View */}
            {!hasCameraAccess && (
              <div className="w-full h-full relative flex flex-col items-center justify-center bg-slate-900 text-slate-300 p-3">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30 filter grayscale contrast-125"
                  style={{
                    backgroundImage: `url(${currentAnglePhoto || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80'})`
                  }}
                />

                <div className="relative z-10 text-center space-y-1.5 max-w-xs">
                  <div className="w-8 h-8 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center mx-auto text-amber-400">
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] font-semibold text-white">
                    Simulador de Estudio Activo
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {cameraErrorMsg ? 'Cámara no detectada.' : 'Modo fotometría calibrado.'} Captura tomas en alta definición.
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded text-[10px] font-medium flex items-center gap-1 mx-auto transition-colors"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {/* Viewfinder Overlays & Crosshairs */}
            <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-2 bg-crosshair-pattern">
              <div className="flex items-center justify-between text-[10px] font-mono text-white/80 drop-shadow">
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>LIVE · 5600K</span>
                </div>
                <div className="bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded border border-white/10 text-[9px]">
                  ISO 100 · 1/125s
                </div>
              </div>

              {/* Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-8 h-8">
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/40" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/40" />
                  <div className="absolute inset-1 border border-white/30 rounded-full" />
                </div>
                <div className="absolute w-2/3 h-2/3 border border-dashed border-white/20 rounded-md pointer-events-none" />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-white/90 drop-shadow">
                <div className="bg-indigo-600/90 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
                  <Camera className="w-2.5 h-2.5" />
                  <span>{activeAngleConfig.label}</span>
                </div>
                <div className="text-white/60 bg-black/40 px-1.5 py-0.5 rounded text-[9px]">
                  {activeAngleConfig.tip}
                </div>
              </div>
            </div>

            {/* Countdown Overlay */}
            {isCountingDown && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-30 animate-in fade-in duration-200">
                <div className="text-6xl font-mono font-black text-white drop-shadow-lg scale-125 animate-pulse">
                  {countdown}
                </div>
              </div>
            )}

            {/* Shutter Flash */}
            {isFlashing && (
              <div className="absolute inset-0 bg-white z-40 animate-shutter pointer-events-none" />
            )}
          </div>

          {/* Shutter CTA Button */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={takeSnapshot}
              disabled={isCountingDown}
              className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>📸 Tomar Foto (Shutter)</span>
              {isCountingDown && <span className="font-mono font-bold">({countdown})</span>}
            </button>
          </div>
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 2x2 Thumbnail Grid */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Cuadrícula de Tomas (2x2)
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
              capturedCount === 4 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {capturedCount}/4 Ángulos
            </span>
          </div>

          <span className="text-[10px] text-slate-400">
            Haz clic en una ranura para enfocarla
          </span>
        </div>

        {/* 2x2 Grid with Compact Height */}
        <div className="grid grid-cols-2 gap-2">
          {ANGLES_CONFIG.map((slot) => {
            const photoUrl = currentForm.photos[slot.id];
            const isSelected = selectedCaptureAngle === slot.id;

            return (
              <div
                key={slot.id}
                onClick={() => setCaptureAngle(slot.id)}
                className={`relative group rounded-lg overflow-hidden border transition-all h-24 sm:h-26 bg-slate-50 flex flex-col justify-between cursor-pointer ${
                  isSelected 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                    : photoUrl 
                      ? 'border-slate-200 hover:border-slate-300' 
                      : 'border-dashed border-slate-300 hover:border-slate-400'
                }`}
              >
                {photoUrl ? (
                  <>
                    <img
                      src={photoUrl}
                      alt={slot.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

                    {/* Top Status */}
                    <div className="absolute top-1 left-1.5 right-1.5 flex items-center justify-between z-10">
                      <span className="text-[9px] font-mono font-bold text-white bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-xs">
                        {slot.number}
                      </span>
                      <span className="flex items-center gap-0.5 text-[9px] text-emerald-300 font-medium bg-emerald-950/70 px-1 py-0.5 rounded backdrop-blur-xs">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        <span>OK</span>
                      </span>
                    </div>

                    {/* Bottom Label */}
                    <div className="absolute bottom-1 left-1.5 right-1.5 z-10">
                      <div className="text-[10px] font-semibold text-white drop-shadow truncate">
                        {slot.label}
                      </div>
                    </div>

                    {/* Hover Actions */}
                    <div 
                      className="absolute inset-0 bg-slate-900/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-20 p-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setCaptureAngle(slot.id)}
                        className="p-1 rounded bg-white/20 hover:bg-white text-white hover:text-slate-900 transition-colors"
                        title="Reenfocar en visor (Retake)"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openModal('enlarge', { url: photoUrl, title: slot.label })}
                        className="p-1 rounded bg-white/20 hover:bg-white text-white hover:text-slate-900 transition-colors"
                        title="Ampliar foto (Enlarge)"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => removePhoto(slot.id)}
                        className="p-1 rounded bg-rose-500/80 hover:bg-rose-600 text-white transition-colors"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  /* Empty Slot */
                  <div className="w-full h-full p-2 flex flex-col items-center justify-center text-center hover:bg-indigo-50/30 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors mb-0.5">
                      <Camera className="w-3 h-3" />
                    </div>
                    <div className="text-[10px] font-semibold text-slate-700">
                      {slot.label}
                    </div>
                    <div className="text-[9px] text-slate-400">
                      Ranura {slot.number}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRefs.current[slot.id]?.click();
                      }}
                      className="mt-0.5 text-[9px] text-indigo-600 hover:text-indigo-800 font-medium underline flex items-center gap-0.5"
                    >
                      <Upload className="w-2.5 h-2.5" />
                      Subir
                    </button>
                  </div>
                )}

                {/* File input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => {
                    fileInputRefs.current[slot.id] = el;
                  }}
                  onChange={(e) => handleFileUpload(slot.id, e)}
                  className="hidden"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Camera, 
  RefreshCw, 
  Video, 
  Sparkles, 
  Check, 
  X, 
  CheckCircle2, 
  Eye, 
  Maximize2
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

export const CameraStudioModal: React.FC = () => {
  const { 
    activeModal, 
    closeModal, 
    selectedCaptureAngle, 
    setCaptureAngle, 
    setPhoto, 
    currentForm, 
    loadStudioPresets, 
    triggerShutterFlash, 
    isFlashing, 
    hardware, 
    openModal 
  } = useCatalogStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string | null>(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Initialize camera only when modal is open
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
    if (activeModal === 'camera') {
      startCamera();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeModal, startCamera]);

  if (activeModal !== 'camera') return null;

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

  const activeAngleConfig = ANGLES_CONFIG.find(a => a.id === selectedCaptureAngle) || ANGLES_CONFIG[0];
  const currentAnglePhoto = currentForm.photos[selectedCaptureAngle];
  const capturedCount = Object.values(currentForm.photos).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div 
        className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-6xl overflow-hidden flex flex-col"
        style={{ height: 'min(700px, 92vh)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="h-14 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-500/20">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">Estudio Fotográfico de Captura</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {hasCameraAccess ? 'Webcam HD 1080p' : 'Simulador Studio'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  {capturedCount}/4 Ángulos
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Puesto de fotometría estándar · Encuadre fijo 100% sin distorsión
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadStudioPresets}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 rounded-lg transition-colors cursor-pointer"
              title="Pre-cargar 4 tomas profesionales de estudio"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cargar Muestras de Estudio</span>
            </button>

            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Cerrar estudio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body: Rigid 2-Column Split (Left: Vista Previa | Right: Cámara) */}
        <div className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
          
          {/* ================= LEFT SECTION: VISTA PREVIA (5 Cols) ================= */}
          <div className="lg:col-span-5 h-full flex flex-col justify-between bg-slate-950/90 rounded-xl p-4 border border-slate-800 overflow-hidden">
            
            {/* 1. Header (Fixed Height) */}
            <div className="h-8 flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Vista Previa
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">
                  {activeAngleConfig.label}
                </span>
              </div>

              {currentAnglePhoto && (
                <button
                  onClick={() => openModal('enlarge', { url: currentAnglePhoto, title: activeAngleConfig.label })}
                  className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Ampliar vista previa"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Ampliar</span>
                </button>
              )}
            </div>

            {/* 2. Main Preview Frame (Locked Height & Aspect Ratio with object-contain to prevent any distortion) */}
            <div className="relative my-3 flex-1 min-h-[280px] max-h-[350px] bg-slate-950 rounded-lg overflow-hidden border border-slate-800/90 flex items-center justify-center shadow-inner">
              {currentAnglePhoto ? (
                <>
                  <img
                    src={currentAnglePhoto}
                    alt={activeAngleConfig.label}
                    className="w-full h-full object-contain p-1"
                  />
                  
                  {/* Status Badges (Absolute overlays) */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/70 backdrop-blur-xs px-2 py-1 rounded-md text-[10px] font-mono text-emerald-300 border border-emerald-500/30 shadow-sm">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Captura OK</span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs px-2 py-1 rounded-md text-[10px] font-mono text-slate-300 border border-white/10 shadow-sm">
                    2400 x 2400 px
                  </div>
                </>
              ) : (
                <div className="p-6 text-center space-y-2 max-w-xs">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Camera className="w-5 h-5 opacity-60" />
                  </div>
                  <div className="text-xs font-semibold text-slate-400">
                    Sin foto para {activeAngleConfig.short}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Apunta la prenda en la cámara de la derecha y presiona el disparador para capturar.
                  </p>
                </div>
              )}
            </div>

            {/* 3. Pinned 4-Slot Filmstrip (Always visible at the bottom, locked height) */}
            <div className="shrink-0 space-y-1.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
                  Seleccionar Ángulo para Previsualizar
                </span>
                <span className="text-[10px] font-mono text-slate-500">4 ranuras fijas</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {ANGLES_CONFIG.map((slot) => {
                  const photo = currentForm.photos[slot.id];
                  const isSelected = selectedCaptureAngle === slot.id;

                  return (
                    <div
                      key={slot.id}
                      onClick={() => setCaptureAngle(slot.id)}
                      className={`relative rounded-lg overflow-hidden border h-16 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-slate-800'
                          : photo
                            ? 'border-slate-700 hover:border-slate-500 bg-slate-900'
                            : 'border-dashed border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      {photo ? (
                        <>
                          <img src={photo} alt={slot.label} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute top-1 left-1 bg-black/60 text-white font-mono text-[8px] px-1 rounded">
                            {slot.number}
                          </div>
                          <div className="absolute bottom-1 left-1 right-1 text-[9px] font-semibold text-white truncate drop-shadow">
                            {slot.short}
                          </div>
                          <div className="absolute top-1 right-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 drop-shadow" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 hover:text-slate-300">
                          <span className="font-mono text-[9px] text-slate-600 mb-0.5">{slot.number}</span>
                          <span className="text-[9px] font-medium">{slot.short}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================= RIGHT SECTION: CÁMARA DE FOTOS (7 Cols) ================= */}
          <div className="lg:col-span-7 h-full flex flex-col justify-between bg-slate-950/90 rounded-xl p-4 border border-slate-800 overflow-hidden">
            
            {/* 1. Header (Fixed Height) */}
            <div className="h-8 flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Cámara de Estudio en Vivo
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-slate-300 border border-slate-700">
                  {hasCameraAccess ? 'Enlazada' : 'Simulador'}
                </span>
              </div>

              <span className="text-[11px] font-mono text-slate-400">
                Toma actual: <strong className="text-indigo-400">{activeAngleConfig.short}</strong>
              </span>
            </div>

            {/* 2. Quick Angle Tabs (Fixed Height) */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/50 rounded-lg border border-slate-800 text-xs font-medium my-2 shrink-0">
              {ANGLES_CONFIG.map((angle) => {
                const isCaptured = !!currentForm.photos[angle.id];
                const isSelected = selectedCaptureAngle === angle.id;

                return (
                  <button
                    key={angle.id}
                    onClick={() => setCaptureAngle(angle.id)}
                    className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-80">{angle.number}</span>
                    <span className="truncate">{angle.short}</span>
                    {isCaptured && (
                      <Check className="w-3 h-3 text-emerald-400 stroke-[3] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* 3. Live Camera Viewfinder (Locked Height & Sizing to match the Left Side exactly) */}
            <div className="relative flex-1 min-h-[280px] max-h-[350px] bg-black rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center group shadow-inner">
              
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

              {/* Fallback Viewport */}
              {!hasCameraAccess && (
                <div className="w-full h-full relative flex flex-col items-center justify-center bg-slate-950 text-slate-300 p-4">
                  <div 
                    className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-40 filter grayscale contrast-125"
                    style={{
                      backgroundImage: `url(${currentAnglePhoto || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80'})`
                    }}
                  />

                  <div className="relative z-10 text-center space-y-1.5 max-w-sm">
                    <div className="w-9 h-9 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center mx-auto text-amber-400 shadow-md">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-white">
                      Modo Estudio de Fotometría Calibrado
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {cameraErrorMsg ? 'No se detectó cámara física o permiso web.' : 'Conexión a cámara establecida.'}
                      {' '}El obturador capturará tomas de estudio de alta definición.
                    </p>
                    <button
                      onClick={startCamera}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reintentar Cámara Web
                    </button>
                  </div>
                </div>
              )}

              {/* Viewfinder Reticle & HUD Overlays */}
              <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3.5 bg-crosshair-pattern">
                {/* Top HUD */}
                <div className="flex items-center justify-between text-[11px] font-mono text-white/90 drop-shadow">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>LIVE 1080p · 5600K</span>
                  </div>
                  <div className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/10 text-[10px]">
                    ISO 100 · 1/125s · {hardware.latencyMs}ms
                  </div>
                </div>

                {/* Center Crosshair & Framing Guides */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-12 h-12">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/50" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/50" />
                    <div className="absolute inset-1.5 border border-white/40 rounded-full" />
                  </div>
                  {/* Framing Brackets */}
                  <div className="absolute w-3/4 h-3/4 border border-dashed border-white/20 rounded-lg pointer-events-none">
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white/90" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white/90" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white/90" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white/90" />
                  </div>
                </div>

                {/* Bottom HUD */}
                <div className="flex items-center justify-between text-[11px] font-mono text-white/90 drop-shadow">
                  <div className="bg-indigo-600/90 text-white px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1.5 border border-indigo-400/40">
                    <Camera className="w-3 h-3" />
                    <span>{activeAngleConfig.label}</span>
                  </div>
                  <div className="text-white/80 bg-black/60 px-2 py-0.5 rounded text-[10px]">
                    {activeAngleConfig.tip}
                  </div>
                </div>
              </div>

              {/* Countdown Overlay */}
              {isCountingDown && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-30 animate-in fade-in duration-200">
                  <div className="text-7xl font-mono font-black text-white drop-shadow-2xl scale-125 animate-pulse">
                    {countdown}
                  </div>
                </div>
              )}

              {/* Shutter Flash Animation */}
              {isFlashing && (
                <div className="absolute inset-0 bg-white z-40 animate-shutter pointer-events-none" />
              )}
            </div>

            {/* 4. Shutter Button (Locked at bottom, fixed height) */}
            <div className="pt-2 shrink-0">
              <button
                type="button"
                onClick={takeSnapshot}
                disabled={isCountingDown}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <Camera className="w-4 h-4 stroke-[2.5]" />
                <span>📸 Disparar Obturador (Shutter)</span>
                {isCountingDown && <span className="font-mono text-amber-300">({countdown}s)</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="h-14 px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Estación fija de fotometría · Calibración 5600K activa</span>
          </div>

          <button
            onClick={closeModal}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            Guardar & Volver a la Ficha
          </button>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

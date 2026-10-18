import React, { useRef } from 'react';
import { 
  Camera, 
  Sparkles, 
  Maximize2, 
  RotateCcw, 
  Trash2, 
  Upload, 
  CheckCircle2
} from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import type { CaptureAngle } from '../types';

const SLOTS_CONFIG: { id: CaptureAngle; label: string; number: string; tip: string }[] = [
  { id: 'frontal', label: 'Imagen 1: Frontal', number: '01', tip: 'Vista frontal' },
  { id: 'posterior', label: 'Imagen 2: Posterior', number: '02', tip: 'Vista dorsal' },
  { id: 'detalle', label: 'Imagen 3: Detalle / Textura', number: '03', tip: 'Macro textil' },
  { id: 'etiqueta', label: 'Imagen 4: Etiqueta / Composición', number: '04', tip: 'Marca y cuidados' },
];

export const PhotoStudioPanel: React.FC = () => {
  const { 
    currentForm, 
    setCaptureAngle, 
    setPhoto, 
    removePhoto, 
    loadStudioPresets, 
    openModal 
  } = useCatalogStore();

  const fileInputRefs = useRef<Record<CaptureAngle, HTMLInputElement | null>>({
    frontal: null,
    posterior: null,
    detalle: null,
    etiqueta: null,
  });

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

  const capturedCount = Object.values(currentForm.photos).filter(Boolean).length;

  const handleOpenStudio = (angle?: CaptureAngle) => {
    if (angle) {
      setCaptureAngle(angle);
    }
    openModal('camera');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 space-y-4 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Estudio Fotográfico de Producto
            </h3>
            <span className="text-[10px] text-slate-400">
              Fotometría y ángulos de catalogación
            </span>
          </div>
        </div>

        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
          capturedCount === 4 
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
            : 'bg-amber-100 text-amber-800 border border-amber-200'
        }`}>
          {capturedCount}/4 Fotos Listas
        </span>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        {/* Main CTA: Open Camera Modal */}
        <button
          type="button"
          onClick={() => handleOpenStudio()}
          className="sm:col-span-8 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
        >
          <Camera className="w-4 h-4 stroke-[2.5]" />
          <span>📸 Abrir Estudio (Tomar Fotos con Cámara)</span>
        </button>

        {/* Studio Presets Fallback */}
        <button
          type="button"
          onClick={loadStudioPresets}
          className="sm:col-span-4 py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          title="Pre-cargar las 4 fotografías profesionales de estudio en un clic"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="truncate">Muestras de Estudio</span>
        </button>
      </div>

      {/* 2x2 Photo Matrix */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-700">
            Cuadrícula de Tomas (2x2)
          </span>
          <span className="text-[11px] text-slate-400">
            Haz clic en una ranura para capturarla con la cámara
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {SLOTS_CONFIG.map((slot) => {
            const photoUrl = currentForm.photos[slot.id];

            return (
              <div
                key={slot.id}
                onClick={() => handleOpenStudio(slot.id)}
                className={`relative group rounded-xl overflow-hidden border transition-all h-32 sm:h-36 bg-slate-50 flex flex-col justify-between cursor-pointer ${
                  photoUrl 
                    ? 'border-slate-200 hover:border-indigo-400 hover:shadow-sm' 
                    : 'border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/20'
                }`}
              >
                {photoUrl ? (
                  <>
                    <img
                      src={photoUrl}
                      alt={slot.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Top Bar */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                      <span className="text-[10px] font-mono font-bold text-white bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                        {slot.number}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-300 font-semibold bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-500/30 backdrop-blur-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>OK</span>
                      </span>
                    </div>

                    {/* Bottom Label */}
                    <div className="absolute bottom-2 left-2 right-2 z-10">
                      <div className="text-xs font-bold text-white drop-shadow truncate">
                        {slot.label}
                      </div>
                      <div className="text-[10px] text-white/70 truncate">
                        {slot.tip}
                      </div>
                    </div>

                    {/* Hover Action Overlay */}
                    <div 
                      className="absolute inset-0 bg-slate-900/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20 p-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleOpenStudio(slot.id)}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white text-white hover:text-slate-900 transition-colors shadow-sm"
                        title="Volver a capturar en cámara (Retake)"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openModal('enlarge', { url: photoUrl, title: slot.label })}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white text-white hover:text-slate-900 transition-colors shadow-sm"
                        title="Inspeccionar en alta resolución (Enlarge)"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => removePhoto(slot.id)}
                        className="p-2 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white transition-colors shadow-sm"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  /* Empty Slot */
                  <div className="w-full h-full p-3 flex flex-col items-center justify-center text-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-all mb-1.5">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                      {slot.label}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Tocar para abrir cámara
                    </div>

                    <div className="mt-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRefs.current[slot.id]?.click();
                        }}
                        className="text-[10px] text-slate-500 hover:text-indigo-600 font-medium underline flex items-center gap-1 transition-colors"
                      >
                        <Upload className="w-2.5 h-2.5" />
                        Subir archivo
                      </button>
                    </div>
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

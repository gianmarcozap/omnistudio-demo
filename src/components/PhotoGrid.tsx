import React, { useRef } from 'react';
import { 
  Camera, 
  Maximize2, 
  RotateCcw, 
  Trash2, 
  Upload, 
  CheckCircle2
} from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import type { CaptureAngle } from '../types';

const SLOTS: { angle: CaptureAngle; label: string; number: string }[] = [
  { angle: 'frontal', label: 'Imagen 1: Frontal', number: '01' },
  { angle: 'posterior', label: 'Imagen 2: Posterior', number: '02' },
  { angle: 'detalle', label: 'Imagen 3: Detalle / Textura', number: '03' },
  { angle: 'etiqueta', label: 'Imagen 4: Etiqueta / Composición', number: '04' },
];

export const PhotoGrid: React.FC = () => {
  const { 
    currentForm, 
    selectedCaptureAngle, 
    setCaptureAngle, 
    setPhoto, 
    removePhoto, 
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

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Cuadrícula de Tomas (2x2)
          </span>
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
            capturedCount === 4 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-amber-100 text-amber-800'
          }`}>
            {capturedCount}/4 Ángulos
          </span>
        </div>

        <span className="text-[11px] text-slate-400">
          Haz clic para retocar o inspeccionar
        </span>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {SLOTS.map((slot) => {
          const photoUrl = currentForm.photos[slot.angle];
          const isSelected = selectedCaptureAngle === slot.angle;

          return (
            <div
              key={slot.angle}
              className={`relative group rounded-lg overflow-hidden border transition-all aspect-[4/3] bg-slate-50 flex flex-col justify-between ${
                isSelected 
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                  : photoUrl 
                    ? 'border-slate-200 hover:border-slate-300' 
                    : 'border-dashed border-slate-300 hover:border-slate-400'
              }`}
            >
              {/* Photo Display */}
              {photoUrl ? (
                <>
                  <img
                    src={photoUrl}
                    alt={slot.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Gradient Overlay for labels */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

                  {/* Top Bar on Card */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between z-10">
                    <span className="text-[10px] font-mono font-bold text-white bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-xs">
                      {slot.number}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-300 font-medium bg-emerald-950/70 px-1.5 py-0.5 rounded backdrop-blur-xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>OK</span>
                    </span>
                  </div>

                  {/* Bottom Label */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 z-10">
                    <div className="text-[11px] font-semibold text-white drop-shadow truncate">
                      {slot.label}
                    </div>
                  </div>

                  {/* Hover Action Overlay */}
                  <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-20 p-2">
                    <button
                      onClick={() => {
                        setCaptureAngle(slot.angle);
                      }}
                      className="p-1.5 rounded-md bg-white/20 hover:bg-white text-white hover:text-slate-900 transition-colors"
                      title="Volver a capturar (Retake)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => openModal('enlarge', { url: photoUrl, title: slot.label })}
                      className="p-1.5 rounded-md bg-white/20 hover:bg-white text-white hover:text-slate-900 transition-colors"
                      title="Ampliar foto (Enlarge)"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => removePhoto(slot.angle)}
                      className="p-1.5 rounded-md bg-rose-500/80 hover:bg-rose-600 text-white transition-colors"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                /* Empty Slot Placeholder */
                <div 
                  onClick={() => setCaptureAngle(slot.angle)}
                  className="w-full h-full p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors mb-1.5">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700">
                    {slot.label}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Presiona para capturar
                  </div>

                  <div className="mt-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRefs.current[slot.angle]?.click();
                      }}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium underline flex items-center gap-0.5"
                    >
                      <Upload className="w-2.5 h-2.5" />
                      Subir archivo
                    </button>
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                ref={(el) => {
                  fileInputRefs.current[slot.angle] = el;
                }}
                onChange={(e) => handleFileUpload(slot.angle, e)}
                className="hidden"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

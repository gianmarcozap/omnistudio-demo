import React from 'react';
import { X, Download } from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';

export const EnlargeModal: React.FC = () => {
  const { activeModal, closeModal, enlargeImageUrl, enlargeTitle } = useCatalogStore();

  if (activeModal !== 'enlarge' || !enlargeImageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      onClick={closeModal}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-xs font-semibold">{enlargeTitle || 'Inspección de Fotografía'}</span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              High-Res Studio Master
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={enlargeImageUrl}
              download="omnistudio-capture.jpg"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
              title="Descargar archivo original"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-950">
          <img
            src={enlargeImageUrl}
            alt="Detalle de estudio"
            className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg border border-slate-800"
          />
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>Resolución: 2400 x 2400 px · sRGB IEC61966-2.1</span>
          <span>Calibración de color: ColorChecker 24-patch OK</span>
        </div>
      </div>
    </div>
  );
};

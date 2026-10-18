import React from 'react';
import { 
  Rocket, 
  RotateCcw, 
  FileSpreadsheet, 
  Sliders, 
  AlertCircle
} from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';

export const PublishPanel: React.FC = () => {
  const { 
    currentForm, 
    executePublishAndSync, 
    clearForm, 
    exportToExcel, 
    openModal,
    isDispatching 
  } = useCatalogStore();

  const activeChannelsCount = Object.values(currentForm.channels).filter(Boolean).length;
  const capturedPhotosCount = Object.values(currentForm.photos).filter(Boolean).length;
  const isFormValid = !!(currentForm.skuParent && currentForm.skuChild && currentForm.name);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 space-y-3.5">
      
      {/* Primary CTA: Publicar & Sincronizar en Canales */}
      <div>
        <button
          type="button"
          onClick={() => executePublishAndSync()}
          disabled={isDispatching || !isFormValid}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2.5 transition-all select-none ${
            isFormValid
              ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-600/25 active:scale-[0.99] cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <Rocket className={`w-4 h-4 stroke-[2.5] ${isDispatching ? 'animate-bounce' : ''}`} />
          <span>🚀 Publicar & Sincronizar en Canales</span>
          <span className="text-xs font-mono font-medium opacity-90 px-2 py-0.5 rounded-full bg-white/20">
            {activeChannelsCount} {activeChannelsCount === 1 ? 'canal' : 'canales'}
          </span>
        </button>

        {/* Validation warning if photos or fields incomplete */}
        {!isFormValid && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-medium mt-2 px-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Por favor complete los campos obligatorios (SKU Padre, SKU Hijo y Nombre).</span>
          </div>
        )}

        {isFormValid && capturedPhotosCount < 4 && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-medium mt-2 px-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Se sugiere capturar las 4 fotos de estudio antes del despacho multi-canal ({capturedPhotosCount}/4 listas).</span>
          </div>
        )}
      </div>

      {/* Secondary Workstation Actions */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
        {/* Limpiar Formulario */}
        <button
          type="button"
          onClick={clearForm}
          className="py-2 px-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          title="Limpiar formulario para ingresar un nuevo artículo desde cero"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate">Limpiar Formulario</span>
        </button>

        {/* Exportar Excel */}
        <button
          type="button"
          onClick={exportToExcel}
          className="py-2 px-2 rounded-lg border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-800 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          title="Descargar planilla CSV / Excel con trazabilidad de catálogo"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span className="truncate">Exportar Excel</span>
        </button>

        {/* Diagnóstico de Hardware */}
        <button
          type="button"
          onClick={() => openModal('diagnostics')}
          className="py-2 px-2 rounded-lg border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-800 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          title="Abrir panel de diagnóstico de sensores, fotómetro y cámara"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
          <span className="truncate">Diagnóstico</span>
        </button>
      </div>
    </div>
  );
};

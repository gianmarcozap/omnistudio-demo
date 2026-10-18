import React from 'react';
import { 
  Camera, 
  RotateCcw, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';

export const Header: React.FC = () => {
  const { 
    processedTodayCount, 
    resetToDemo, 
    items, 
    activeItemId, 
    selectItem, 
    openModal 
  } = useCatalogStore();

  const [isItemMenuOpen, setIsItemMenuOpen] = React.useState(false);

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-30 select-none shadow-sm relative">
      {/* Left: Station Identity & Live Metrics */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-100">
            <Camera className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 tracking-tight text-sm">OmniStudio</span>
              <span className="text-slate-300 font-light">·</span>
              <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Catalog Station #01
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              Estación de Registro & Fotometría
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* Live Processing Counter */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs text-slate-600 font-medium">
            Artículos procesados hoy:
          </span>
          <span className="text-xs font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
            {processedTodayCount}
          </span>
        </div>

        {/* Quick Item Preset Selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setIsItemMenuOpen(!isItemMenuOpen)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Muestras Pre-cargadas</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isItemMenuOpen && (
            <div 
              className="absolute left-0 mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs"
              onMouseLeave={() => setIsItemMenuOpen(false)}
            >
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Seleccionar Ítem de Inspección
              </div>
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    selectItem(item.id);
                    setIsItemMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    activeItemId === item.id ? 'bg-indigo-50/60 font-medium text-indigo-700' : 'text-slate-700'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-mono text-[11px] text-slate-500">{item.skuParent}</div>
                    <div className="truncate text-slate-800">{item.name}</div>
                  </div>
                  {activeItemId === item.id && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Hardware Status, Sandbox Badge & Reset */}
      <div className="flex items-center gap-3">
        {/* Hardware Status Button */}
        <button
          onClick={() => openModal('diagnostics')}
          className="group flex items-center gap-2 px-2.5 py-1 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-lg text-emerald-800 text-xs font-medium transition-all"
          title="Ver telemetría del estudio fotográfico"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100 group-hover:ring-emerald-200 transition-all" />
          <span className="hidden xl:inline">Estado:</span>
          <span>Conectado a Estudio de Fotos</span>
          <Sliders className="w-3 h-3 text-emerald-600 opacity-60 group-hover:opacity-100" />
        </button>

        {/* Demo Sandbox Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200/80 rounded-lg text-xs font-medium">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Demo Sandbox</span>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetToDemo}
          className="flex items-center gap-1.5 px-3 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-xs font-medium border border-transparent hover:border-slate-200 transition-colors"
          title="Restaurar estado inicial de demostración"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">↻ Reiniciar datos</span>
          <span className="sm:hidden">Reset</span>
        </button>
      </div>
    </header>
  );
};

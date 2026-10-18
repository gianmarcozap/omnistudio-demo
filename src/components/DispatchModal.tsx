import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Loader2, 
  X, 
  ExternalLink, 
  Rocket, 
  Server, 
  Cloud, 
  ShoppingBag, 
  Layers, 
  Check, 
  Sparkles
} from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import { playSuccessChime } from '../utils/audio';

export const DispatchModal: React.FC = () => {
  const { 
    activeModal, 
    closeModal, 
    isDispatching, 
    dispatchStep, 
    dispatchLogs, 
    dispatchSuccess, 
    currentForm 
  } = useCatalogStore();

  useEffect(() => {
    if (dispatchSuccess && activeModal === 'dispatch') {
      playSuccessChime();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#008060', '#FFE600', '#FF9900', '#10B981'],
        });
      } catch {
        // Ignore if confetti blocked
      }
    }
  }, [dispatchSuccess, activeModal]);

  if (activeModal !== 'dispatch') return null;

  const stepsMeta = [
    { num: 1, title: 'Carga de Imágenes CDN', icon: Cloud },
    { num: 2, title: 'Shopify REST API', icon: ShoppingBag },
    { num: 3, title: 'Mercado Libre Full', icon: Layers },
    { num: 4, title: 'Índice de Almacén WMS', icon: Server },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
              dispatchSuccess ? 'bg-emerald-600' : 'bg-indigo-600'
            }`}>
              {dispatchSuccess ? <Check className="w-4 h-4 stroke-[3]" /> : <Rocket className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {dispatchSuccess ? '¡Despacho Multi-Canal Completado!' : 'Sincronizando Catálogo en Tiempo Real'}
              </h3>
              <p className="text-[11px] font-mono text-slate-500">
                SKU: {currentForm.skuParent} · Variante: {currentForm.skuChild}
              </p>
            </div>
          </div>

          {!isDispatching && (
            <button
              onClick={closeModal}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Progress Indicators Bar */}
          <div className="grid grid-cols-4 gap-2">
            {stepsMeta.map((s) => {
              const StepIcon = s.icon;
              const isPast = dispatchStep > s.num || dispatchSuccess;
              const isCurrent = dispatchStep === s.num && !dispatchSuccess;

              return (
                <div 
                  key={s.num} 
                  className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                    isPast
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                      : isCurrent
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mb-1 text-xs">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    ) : (
                      <StepIcon className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold leading-tight line-clamp-1">
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Real-time Terminal Log Console */}
          <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 border border-slate-800 shadow-inner max-h-56 overflow-y-auto">
            <div className="text-[10px] text-slate-500 flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span>DISPATCH CONSOLE ENGINE v2.4</span>
              <span>STATION: #01</span>
            </div>

            {dispatchLogs.map((log) => (
              <div key={log.step} className="flex items-start gap-2 text-[11px] leading-relaxed">
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <div className="flex-1">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    {log.status === 'success' && <span className="text-emerald-400 font-bold">✔</span>}
                    {log.status === 'in_progress' && <span className="text-indigo-400 animate-pulse font-bold">●</span>}
                    <span>Paso {log.step}: {log.title}</span>
                  </div>
                  <div className="text-slate-400 text-[10px] pl-4">{log.detail}</div>
                </div>
              </div>
            ))}

            {isDispatching && (
              <div className="flex items-center gap-2 text-indigo-400 text-[11px] pt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Ejecutando llamadas de red seguras...</span>
              </div>
            )}
          </div>

          {/* Success Summary & Channel Links */}
          {dispatchSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Publicación en vivo completada exitosamente</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {currentForm.channels.shopify && (
                  <a
                    href="https://shopify.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 bg-white rounded-lg border border-emerald-200 hover:border-emerald-400 text-slate-700 hover:text-emerald-800 transition-colors shadow-2xs"
                  >
                    <span className="font-medium">Ver en Shopify</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}

                {currentForm.channels.mercadolibre && (
                  <a
                    href="https://mercadolibre.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 bg-white rounded-lg border border-amber-200 hover:border-amber-400 text-slate-700 hover:text-amber-800 transition-colors shadow-2xs"
                  >
                    <span className="font-medium">Ver en Mercado Libre</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}

                {currentForm.channels.woocommerce && (
                  <a
                    href="https://woocommerce.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 bg-white rounded-lg border border-purple-200 hover:border-purple-400 text-slate-700 hover:text-purple-800 transition-colors shadow-2xs"
                  >
                    <span className="font-medium">Ver en WooCommerce B2B</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}

                {currentForm.channels.amazon && (
                  <a
                    href="https://amazon.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 bg-white rounded-lg border border-orange-200 hover:border-orange-400 text-slate-700 hover:text-orange-800 transition-colors shadow-2xs"
                  >
                    <span className="font-medium">Ver en Amazon Seller</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Transacción #TX-{Math.floor(100000 + Math.random() * 900000)}
          </span>

          <button
            onClick={closeModal}
            disabled={isDispatching}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {dispatchSuccess ? 'Cerrar y Continuar' : 'Procesando...'}
          </button>
        </div>
      </div>
    </div>
  );
};

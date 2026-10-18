import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  Camera, 
  Sun, 
  Scale, 
  Barcode, 
  CheckCircle2, 
  RefreshCw
} from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';

export const DiagnosticsModal: React.FC = () => {
  const { activeModal, closeModal, hardware } = useCatalogStore();
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [luxValue, setLuxValue] = useState(1420);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  if (activeModal !== 'diagnostics') return null;

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
    }, 1000);
  };

  const handleTestBarcode = () => {
    const codes = ['7751234567890', '7759876543210', '0123456789012'];
    const random = codes[Math.floor(Math.random() * codes.length)];
    setScannedCode(random);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Diagnóstico de Hardware & Telemetría
              </h3>
              <p className="text-[11px] text-slate-500">
                OmniStudio Station #01 · Bus USB 3.2 Gen 2
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostic Items */}
        <div className="p-6 space-y-4">
          
          {/* Item 1: Camera Sensor */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Cámara de Estudio Principal
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {hardware.cameraName}
                </div>
                <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Latencia: {hardware.latencyMs}ms · 1080p 60fps Tethered
                </div>
              </div>
            </div>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase">
              Operativo
            </span>
          </div>

          {/* Item 2: Photometer / Lighting */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Fotómetro de Estudio & Luces Softbox
                </div>
                <div className="text-[11px] text-slate-500">
                  5600K Blanco Frío · CRI 98+
                </div>
                <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                  Lectura actual: <span className="font-bold text-slate-900">{luxValue} Lux</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setLuxValue(luxValue === 1420 ? 1650 : 1420)}
                className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 transition-colors"
              >
                Probar Destello
              </button>
            </div>
          </div>

          {/* Item 3: Scale */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Balanza Digital USB de Precisión
                </div>
                <div className="text-[11px] text-slate-500">
                  Calibración: {hardware.calibrationDate}
                </div>
                <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                  Tara: <span className="font-bold text-slate-900">0.00 kg</span> · Carga: <span className="font-bold text-slate-900">{hardware.scaleWeightKg} kg</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCalibrate}
              disabled={isCalibrating}
              className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isCalibrating ? 'animate-spin' : ''}`} />
              <span>{isCalibrating ? 'Calibrando...' : 'Tarar'}</span>
            </button>
          </div>

          {/* Item 4: Barcode Scanner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                <Barcode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Lector de Código de Barras Láser (HID)
                </div>
                <div className="text-[11px] text-slate-500">
                  Soporta EAN-13, UPC-A, Code 128
                </div>
                {scannedCode && (
                  <div className="text-[10px] text-indigo-700 font-mono font-bold mt-0.5">
                    Último escaneo: {scannedCode}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleTestBarcode}
              className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 transition-colors"
            >
              Simular Pistola
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Todos los subsistemas respondiendo nominalmente</span>
          </div>

          <button
            onClick={closeModal}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

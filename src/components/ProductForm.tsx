import React, { useState } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Box, 
  Check
} from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import type { ProductCondition, ProductCategory, Currency } from '../types';

export const ProductForm: React.FC = () => {
  const { 
    currentForm, 
    updateFormField, 
    autoGenerateSku, 
    generateAiDescription, 
    toggleChannel,
    hardware
  } = useCatalogStore();

  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Volumetric weight calculation: (L * W * H) / 5000 kg (IATA e-commerce standard)
  const l = Number(currentForm.length) || 0;
  const w = Number(currentForm.width) || 0;
  const h = Number(currentForm.height) || 0;
  const volumetricWeight = ((l * w * h) / 5000).toFixed(2);
  const physicalWeight = hardware.scaleWeightKg.toFixed(2);
  const billableWeight = Math.max(Number(volumetricWeight), Number(physicalWeight)).toFixed(2);

  const handleAiClick = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      generateAiDescription();
      setIsAiGenerating(false);
    }, 600);
  };

  const categories: ProductCategory[] = [
    'Ropa Exterior',
    'Calzado',
    'Accesorios',
    'Pantalones',
    'Polos y Camisas',
  ];

  const conditions: ProductCondition[] = [
    'Nuevo con etiqueta',
    'Reacondicionado',
    'Liquidación',
  ];

  const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38 EU', '40 EU', '42 EU', '44 EU', 'One Size'];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 space-y-6">
      
      {/* Group 1: Identification */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-700">
              1
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Identificación & Trazabilidad
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Campos obligatorios *</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* SKU Padre */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              SKU Padre <span className="text-rose-500">*</span>
            </label>
            <div className="flex rounded-lg shadow-2xs">
              <input
                type="text"
                value={currentForm.skuParent}
                onChange={(e) => updateFormField('skuParent', e.target.value.toUpperCase())}
                placeholder="APP-JKT-004"
                className="flex-1 min-w-0 font-mono text-xs uppercase px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900 transition-all"
              />
              <button
                type="button"
                onClick={autoGenerateSku}
                title="Auto-generar SKU basado en categoría y atributos"
                className="inline-flex items-center gap-1 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-l-0 border-slate-200 rounded-r-lg text-xs font-medium text-slate-700 transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Auto</span>
              </button>
            </div>
          </div>

          {/* SKU Hijo */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              SKU Hijo / Variante <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={currentForm.skuChild}
              onChange={(e) => updateFormField('skuChild', e.target.value.toUpperCase())}
              placeholder="APP-JKT-004-BLK-M"
              className="w-full font-mono text-xs uppercase px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900 shadow-2xs transition-all"
            />
          </div>

          {/* Estado de Producto */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estado de Producto <span className="text-rose-500">*</span>
            </label>
            <select
              value={currentForm.condition}
              onChange={(e) => updateFormField('condition', e.target.value as ProductCondition)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium shadow-2xs transition-all cursor-pointer"
            >
              {conditions.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Group 2: Product Details */}
      <section className="space-y-3.5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-700">
            2
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Ficha Técnica & Comercial
          </h2>
        </div>

        {/* Nombre del Producto */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nombre del Producto <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={currentForm.name}
            onChange={(e) => updateFormField('name', e.target.value)}
            placeholder="Ej. Chaqueta Cortavientos Impermeable Technical Storm"
            className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900 shadow-2xs transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Categoría <span className="text-rose-500">*</span>
            </label>
            <select
              value={currentForm.category}
              onChange={(e) => updateFormField('category', e.target.value as ProductCategory)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800 shadow-2xs transition-all cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Marca */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Marca <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={currentForm.brand}
              onChange={(e) => updateFormField('brand', e.target.value)}
              placeholder="Ej. NorthTrail"
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900 shadow-2xs transition-all"
            />
          </div>

          {/* Talla */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Talla <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="sizes-datalist"
                value={currentForm.size}
                onChange={(e) => updateFormField('size', e.target.value)}
                placeholder="Ej. M"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900 shadow-2xs transition-all"
              />
              <datalist id="sizes-datalist">
                {standardSizes.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Color <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={currentForm.color}
              onChange={(e) => updateFormField('color', e.target.value)}
              placeholder="Ej. Negro Mate"
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900 shadow-2xs transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Material */}
          <div className="md:col-span-8">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Material & Composición <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={currentForm.material}
              onChange={(e) => updateFormField('material', e.target.value)}
              placeholder="Ej. Nylon Ripstop 2.5L con membrana DWR"
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900 shadow-2xs transition-all"
            />
          </div>

          {/* Precio y Moneda */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Precio de Venta <span className="text-rose-500">*</span>
            </label>
            <div className="flex rounded-lg shadow-2xs">
              <select
                value={currentForm.currency}
                onChange={(e) => updateFormField('currency', e.target.value as Currency)}
                className="px-2 py-2 bg-slate-100 border border-slate-200 rounded-l-lg text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="USD">$ USD</option>
                <option value="PEN">S/ PEN</option>
              </select>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentForm.price || ''}
                onChange={(e) => updateFormField('price', parseFloat(e.target.value) || 0)}
                placeholder="129.90"
                className="flex-1 min-w-0 text-xs font-mono font-semibold px-3 py-2 bg-white border border-l-0 border-slate-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Group 3: Physical Dimensions & Volumetric Weight */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-700">
              3
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Dimensiones Físicas & Cubicaje Logístico
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">IATA Divisor: 5000</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-end">
          {/* Ancho */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Ancho (cm) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={currentForm.width || ''}
              onChange={(e) => updateFormField('width', parseFloat(e.target.value) || 0)}
              placeholder="38"
              className="w-full font-mono text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-900 shadow-2xs"
            />
          </div>

          {/* Altura */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Altura (cm) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={currentForm.height || ''}
              onChange={(e) => updateFormField('height', parseFloat(e.target.value) || 0)}
              placeholder="8"
              className="w-full font-mono text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-900 shadow-2xs"
            />
          </div>

          {/* Largo */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Largo (cm) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={currentForm.length || ''}
              onChange={(e) => updateFormField('length', parseFloat(e.target.value) || 0)}
              placeholder="45"
              className="w-full font-mono text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-900 shadow-2xs"
            />
          </div>

          {/* Volumetric Weight Calculator Output */}
          <div className="lg:col-span-6 bg-slate-50 border border-slate-200/90 rounded-lg p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Box className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Cálculo Volumétrico
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {volumetricWeight} kg
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({l}×{w}×{h} / 5000)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right border-l border-slate-200 pl-3">
              <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                Peso Facturable
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-100 text-indigo-800">
                {billableWeight} kg
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Group 4: Commercial Description with AI */}
      <section className="space-y-2">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-700">
              4
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Descripción & Copy Comercial
            </h2>
          </div>

          <button
            type="button"
            onClick={handleAiClick}
            disabled={isAiGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 border border-indigo-200/80 rounded-lg text-xs font-medium shadow-2xs transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${isAiGenerating ? 'animate-spin' : ''}`} />
            <span>{isAiGenerating ? 'Redactando con IA...' : 'Generar descripción comercial con IA'}</span>
          </button>
        </div>

        <textarea
          rows={3}
          value={currentForm.description}
          onChange={(e) => updateFormField('description', e.target.value)}
          placeholder="Escriba aquí los detalles comerciales o presione 'Generar descripción comercial con IA'..."
          className="w-full text-xs leading-relaxed px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400 shadow-2xs transition-all"
        />
      </section>

      {/* Group 5: Multi-Channel Sync Destinations */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-700">
              5
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Destinos de Sincronización Multi-Canal
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Selecciona canales activos para despacho</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Shopify */}
          <div
            onClick={() => toggleChannel('shopify')}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
              currentForm.channels.shopify
                ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200'
                : 'bg-slate-50/50 border-slate-200 opacity-60 hover:opacity-90'
            }`}
          >
            <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              currentForm.channels.shopify 
                ? 'bg-emerald-600 border-emerald-600 text-white' 
                : 'border-slate-300 bg-white'
            }`}>
              {currentForm.channels.shopify && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Shopify</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-emerald-100 text-emerald-800">
                  Active Store
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                mystore.myshopify.com
              </p>
            </div>
          </div>

          {/* Mercado Libre */}
          <div
            onClick={() => toggleChannel('mercadolibre')}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
              currentForm.channels.mercadolibre
                ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-200'
                : 'bg-slate-50/50 border-slate-200 opacity-60 hover:opacity-90'
            }`}
          >
            <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              currentForm.channels.mercadolibre 
                ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold' 
                : 'border-slate-300 bg-white'
            }`}>
              {currentForm.channels.mercadolibre && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Mercado Libre</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-amber-100 text-amber-900">
                  Full Fulfillment
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Mercado Envíos Full Habilitado
              </p>
            </div>
          </div>

          {/* WooCommerce */}
          <div
            onClick={() => toggleChannel('woocommerce')}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
              currentForm.channels.woocommerce
                ? 'bg-purple-50/40 border-purple-300 ring-1 ring-purple-200'
                : 'bg-slate-50/50 border-slate-200 opacity-60 hover:opacity-90'
            }`}
          >
            <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              currentForm.channels.woocommerce 
                ? 'bg-purple-600 border-purple-600 text-white' 
                : 'border-slate-300 bg-white'
            }`}>
              {currentForm.channels.woocommerce && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">WooCommerce</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-purple-100 text-purple-800">
                  B2B Catalog
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                wholesale.omnistudio.store
              </p>
            </div>
          </div>

          {/* Amazon */}
          <div
            onClick={() => toggleChannel('amazon')}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
              currentForm.channels.amazon
                ? 'bg-orange-50/40 border-orange-300 ring-1 ring-orange-200'
                : 'bg-slate-50/50 border-slate-200 opacity-60 hover:opacity-90'
            }`}
          >
            <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              currentForm.channels.amazon 
                ? 'bg-orange-500 border-orange-500 text-white' 
                : 'border-slate-300 bg-white'
            }`}>
              {currentForm.channels.amazon && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Amazon Seller</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-orange-100 text-orange-900">
                  FBA Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Amazon North America SP-API
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

import { create } from 'zustand';
import type { ProductItem, CaptureAngle, ChannelId, HardwareStatus, DispatchLog } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';

interface CatalogStore {
  items: ProductItem[];
  activeItemId: string;
  currentForm: ProductItem;
  processedTodayCount: number;
  
  // Camera & Capture
  selectedCaptureAngle: CaptureAngle;
  isCameraModalOpen: boolean;
  isStreaming: boolean;
  cameraError: string | null;
  isCountingDown: boolean;
  countdownValue: number;
  isFlashing: boolean;

  // Modals & Panels
  activeModal: 'camera' | 'dispatch' | 'diagnostics' | 'items' | 'enlarge' | null;
  enlargeImageUrl: string | null;
  enlargeTitle: string | null;

  // Dispatch Animation State
  isDispatching: boolean;
  dispatchStep: number;
  dispatchLogs: DispatchLog[];
  dispatchSuccess: boolean;
  
  // Hardware Status
  hardware: HardwareStatus;

  // Actions
  updateFormField: <K extends keyof ProductItem>(field: K, value: ProductItem[K]) => void;
  autoGenerateSku: () => void;
  generateAiDescription: () => void;
  toggleChannel: (channelId: ChannelId) => void;
  selectItem: (id: string) => void;
  setCaptureAngle: (angle: CaptureAngle) => void;
  setPhoto: (angle: CaptureAngle, url: string) => void;
  removePhoto: (angle: CaptureAngle) => void;
  loadStudioPresets: () => void;
  clearForm: () => void;
  resetToDemo: () => void;
  openModal: (modal: 'camera' | 'dispatch' | 'diagnostics' | 'items' | 'enlarge', payload?: { url?: string; title?: string }) => void;
  closeModal: () => void;
  startCountdownAndCapture: (captureCallback: () => void) => void;
  triggerShutterFlash: () => void;
  setCameraError: (err: string | null) => void;
  setIsStreaming: (streaming: boolean) => void;
  executePublishAndSync: () => Promise<void>;
  exportToExcel: () => void;
}

const BLANK_FORM: ProductItem = {
  id: '',
  skuParent: '',
  skuChild: '',
  condition: 'Nuevo con etiqueta',
  name: '',
  category: 'Ropa Exterior',
  brand: '',
  material: '',
  size: 'M',
  color: '',
  price: 0,
  currency: 'USD',
  width: 0,
  height: 0,
  length: 0,
  description: '',
  channels: {
    shopify: true,
    mercadolibre: true,
    woocommerce: false,
    amazon: false,
  },
  photos: {
    frontal: null,
    posterior: null,
    detalle: null,
    etiqueta: null,
  },
  status: 'borrador',
};

export const useCatalogStore = create<CatalogStore>((set, get) => ({
  items: JSON.parse(JSON.stringify(INITIAL_PRODUCTS)),
  activeItemId: INITIAL_PRODUCTS[0].id,
  currentForm: JSON.parse(JSON.stringify(INITIAL_PRODUCTS[0])),
  processedTodayCount: 14,

  // Camera & Capture
  selectedCaptureAngle: 'frontal',
  isCameraModalOpen: false,
  isStreaming: false,
  cameraError: null,
  isCountingDown: false,
  countdownValue: 3,
  isFlashing: false,

  // Modals & Panels
  activeModal: null,
  enlargeImageUrl: null,
  enlargeTitle: null,

  // Dispatch Animation State
  isDispatching: false,
  dispatchStep: 0,
  dispatchLogs: [],
  dispatchSuccess: false,

  // Hardware Status
  hardware: {
    connected: true,
    cameraName: 'Sony Alpha ILCE-7RM4 (USB Tethered Studio)',
    latencyMs: 14,
    lightingLux: 1420,
    scaleWeightKg: 0.85,
    scannerConnected: true,
    calibrationDate: 'Hoy, 08:30 AM',
  },

  updateFormField: (field, value) => {
    set((state) => {
      const updated = { ...state.currentForm, [field]: value };
      
      // Auto adjust SKU Child if parent, size, or color changes and child was previously generated
      if (field === 'skuParent' || field === 'size' || field === 'color') {
        if (updated.skuParent) {
          const sizeCode = (updated.size || 'M').replace(/\s+/g, '').toUpperCase().slice(0, 3);
          const colorCode = (updated.color || 'STD').replace(/\s+/g, '').toUpperCase().slice(0, 3);
          updated.skuChild = `${updated.skuParent}-${colorCode}-${sizeCode}`;
        }
      }

      return { currentForm: updated };
    });
  },

  autoGenerateSku: () => {
    const { currentForm } = get();
    const catPrefixes: Record<string, string> = {
      'Ropa Exterior': 'APP-JKT',
      'Calzado': 'FTW-SH',
      'Accesorios': 'ACC-BAG',
      'Pantalones': 'APP-PNT',
      'Polos y Camisas': 'APP-TOP',
    };

    const prefix = catPrefixes[currentForm.category] || 'GEN-SKU';
    const randomNum = Math.floor(100 + Math.random() * 900);
    const parent = `${prefix}-${randomNum}`;
    const sizeCode = (currentForm.size || 'M').replace(/\s+/g, '').toUpperCase().slice(0, 3);
    const colorCode = (currentForm.color || 'BLK').replace(/\s+/g, '').toUpperCase().slice(0, 3);
    const child = `${parent}-${colorCode}-${sizeCode}`;

    set((state) => ({
      currentForm: {
        ...state.currentForm,
        skuParent: parent,
        skuChild: child,
      },
    }));
  },

  generateAiDescription: () => {
    const { currentForm } = get();
    const titles = currentForm.name || 'Prenda de alta durabilidad';
    const brand = currentForm.brand || 'Colección Técnica';
    const material = currentForm.material || 'Material premium de alta resistencia';
    const cat = currentForm.category;

    const templates = [
      `Diseño contemporáneo de ${brand} para ${cat.toLowerCase()}. Elaborado con ${material}, ofrece un ajuste ergonómico superior y máxima durabilidad para el uso continuo. Cuenta con refuerzos en costuras críticas y acabados minimalistas adecuados tanto para entorno urbano como actividades técnicas.`,
      `Edición profesional de ${brand}. Este artículo de ${cat.toLowerCase()} combina innovación textil con ${material} para garantizar ligereza, confort térmico y protección duradera. Inspeccionado bajo estándares de calidad industrial con trazabilidad garantizada en SKU padre ${currentForm.skuParent || 'GEN'}.`,
      `El modelo ${titles} de ${brand} redefine los estándares en su categoría. Confeccionado en ${material}, proporciona resistencia al desgaste y un balance perfecto entre estética y funcionalidad logística.`,
    ];

    const randomDesc = templates[Math.floor(Math.random() * templates.length)];
    get().updateFormField('description', randomDesc);
  },

  toggleChannel: (channelId) => {
    set((state) => ({
      currentForm: {
        ...state.currentForm,
        channels: {
          ...state.currentForm.channels,
          [channelId]: !state.currentForm.channels[channelId],
        },
      },
    }));
  },

  selectItem: (id) => {
    const item = get().items.find((i) => i.id === id);
    if (item) {
      set({
        activeItemId: id,
        currentForm: JSON.parse(JSON.stringify(item)),
        activeModal: null,
      });
    }
  },

  setCaptureAngle: (angle) => {
    set({ selectedCaptureAngle: angle });
  },

  setPhoto: (angle, url) => {
    set((state) => ({
      currentForm: {
        ...state.currentForm,
        photos: {
          ...state.currentForm.photos,
          [angle]: url,
        },
      },
    }));
  },

  removePhoto: (angle) => {
    set((state) => ({
      currentForm: {
        ...state.currentForm,
        photos: {
          ...state.currentForm.photos,
          [angle]: null,
        },
      },
    }));
  },

  loadStudioPresets: () => {
    const { activeItemId, items } = get();
    const matched = items.find((i) => i.id === activeItemId) || INITIAL_PRODUCTS[0];
    
    set((state) => ({
      currentForm: {
        ...state.currentForm,
        photos: { ...matched.photos },
      },
    }));
  },

  clearForm: () => {
    const freshSku = `PRD-${Math.floor(1000 + Math.random() * 9000)}`;
    set({
      activeItemId: 'custom-new',
      currentForm: {
        ...BLANK_FORM,
        id: `item-${Date.now()}`,
        skuParent: freshSku,
        skuChild: `${freshSku}-BLK-M`,
        color: 'Negro',
        brand: 'Industrial Pro',
        material: 'Poliéster Reciclado 300D',
        price: 49.90,
        width: 30,
        height: 5,
        length: 35,
      },
      activeModal: null,
    });
  },

  resetToDemo: () => {
    const cloned = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    set({
      items: cloned,
      activeItemId: cloned[0].id,
      currentForm: JSON.parse(JSON.stringify(cloned[0])),
      processedTodayCount: 14,
      selectedCaptureAngle: 'frontal',
      activeModal: null,
      enlargeImageUrl: null,
      isDispatching: false,
      dispatchStep: 0,
      dispatchLogs: [],
      dispatchSuccess: false,
    });
  },

  openModal: (modal, payload) => {
    set({
      activeModal: modal,
      enlargeImageUrl: payload?.url || null,
      enlargeTitle: payload?.title || null,
    });
  },

  closeModal: () => {
    set({
      activeModal: null,
      enlargeImageUrl: null,
      enlargeTitle: null,
    });
  },

  triggerShutterFlash: () => {
    set({ isFlashing: true });
    setTimeout(() => {
      set({ isFlashing: false });
    }, 400);
  },

  startCountdownAndCapture: (captureCallback) => {
    set({ isCountingDown: true, countdownValue: 3 });

    const interval = setInterval(() => {
      const current = get().countdownValue;
      if (current <= 1) {
        clearInterval(interval);
        set({ isCountingDown: false, countdownValue: 3 });
        get().triggerShutterFlash();
        captureCallback();
      } else {
        set({ countdownValue: current - 1 });
      }
    }, 1000);
  },

  setCameraError: (err) => {
    set({ cameraError: err });
  },

  setIsStreaming: (streaming) => {
    set({ isStreaming: streaming });
  },

  executePublishAndSync: async () => {
    const { currentForm, processedTodayCount } = get();

    set({
      activeModal: 'dispatch',
      isDispatching: true,
      dispatchStep: 1,
      dispatchSuccess: false,
      dispatchLogs: [
        {
          step: 1,
          title: 'Subiendo fotografías de estudio a CDN',
          detail: 'Procesando 4 perspectivas de alta resolución (WebP 2400x2400px)',
          status: 'in_progress',
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    });

    // Step 1: CDN Upload
    await new Promise((resolve) => setTimeout(resolve, 800));
    set((state) => ({
      dispatchStep: 2,
      dispatchLogs: [
        { ...state.dispatchLogs[0], status: 'success', detail: 'CDN Cloudflare Edge: 4 assets cargados en 210ms (100%)' },
        {
          step: 2,
          title: 'Payload Shopify REST API',
          detail: `POST /admin/api/2024-04/products.json -> SKU: ${currentForm.skuParent}`,
          status: 'in_progress',
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    }));

    // Step 2: Shopify REST payload
    await new Promise((resolve) => setTimeout(resolve, 900));
    set((state) => ({
      dispatchStep: 3,
      dispatchLogs: [
        state.dispatchLogs[0],
        { ...state.dispatchLogs[1], status: 'success', detail: 'HTTP 200 OK — Producto #91208492 Creado en Shopify' },
        {
          step: 3,
          title: 'Mercado Libre Attributes Push',
          detail: 'POST /items con atributos de marca, peso volumétrico y fotos sincronizadas',
          status: 'in_progress',
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    }));

    // Step 3: Mercado Libre
    await new Promise((resolve) => setTimeout(resolve, 900));
    set((state) => ({
      dispatchStep: 4,
      dispatchLogs: [
        state.dispatchLogs[0],
        state.dispatchLogs[1],
        { ...state.dispatchLogs[2], status: 'success', detail: 'HTTP 201 Created — Publicación MLA-94827104 vinculada a Envíos Full' },
        {
          step: 4,
          title: 'Actualizando índice de inventario de almacén',
          detail: 'Notificando a WMS Station #01 y bloqueando stock físico de muestra',
          status: 'in_progress',
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    }));

    // Step 4: Warehouse index
    await new Promise((resolve) => setTimeout(resolve, 700));
    set((state) => ({
      isDispatching: false,
      dispatchSuccess: true,
      processedTodayCount: processedTodayCount + 1,
      dispatchLogs: [
        state.dispatchLogs[0],
        state.dispatchLogs[1],
        state.dispatchLogs[2],
        { ...state.dispatchLogs[3], status: 'success', detail: 'WMS OK: Registro SKU guardado y catalogado exitosamente' },
      ],
      currentForm: {
        ...state.currentForm,
        status: 'sincronizado',
        publishedAt: new Date().toLocaleTimeString(),
      },
    }));
  },

  exportToExcel: () => {
    const { currentForm, items } = get();
    const rows = [
      ['SKU Padre', 'SKU Hijo', 'Nombre', 'Categoria', 'Marca', 'Material', 'Talla', 'Color', 'Precio USD', 'Largo (cm)', 'Ancho (cm)', 'Alto (cm)', 'Peso Volumétrico (kg)', 'Shopify', 'Mercado Libre', 'WooCommerce', 'Amazon', 'Estado'],
      ...items.map((i) => [
        i.skuParent,
        i.skuChild,
        `"${i.name.replace(/"/g, '""')}"`,
        i.category,
        i.brand,
        `"${i.material.replace(/"/g, '""')}"`,
        i.size,
        i.color,
        i.price.toFixed(2),
        i.length,
        i.width,
        i.height,
        ((i.length * i.width * i.height) / 5000).toFixed(2),
        i.channels.shopify ? 'ACTIVO' : 'INACTIVO',
        i.channels.mercadolibre ? 'ACTIVO' : 'INACTIVO',
        i.channels.woocommerce ? 'ACTIVO' : 'INACTIVO',
        i.channels.amazon ? 'ACTIVO' : 'INACTIVO',
        i.status,
      ]),
      [
        currentForm.skuParent + ' (Formulario Actual)',
        currentForm.skuChild,
        `"${currentForm.name.replace(/"/g, '""')}"`,
        currentForm.category,
        currentForm.brand,
        `"${currentForm.material.replace(/"/g, '""')}"`,
        currentForm.size,
        currentForm.color,
        currentForm.price.toFixed(2),
        currentForm.length,
        currentForm.width,
        currentForm.height,
        ((currentForm.length * currentForm.width * currentForm.height) / 5000).toFixed(2),
        currentForm.channels.shopify ? 'ACTIVO' : 'INACTIVO',
        currentForm.channels.mercadolibre ? 'ACTIVO' : 'INACTIVO',
        currentForm.channels.woocommerce ? 'ACTIVO' : 'INACTIVO',
        currentForm.channels.amazon ? 'ACTIVO' : 'INACTIVO',
        currentForm.status,
      ],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `omnistudio_catalogo_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
}));

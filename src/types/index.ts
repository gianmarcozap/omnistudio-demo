export type ProductCondition = 'Nuevo con etiqueta' | 'Reacondicionado' | 'Liquidación';

export type ProductCategory = 
  | 'Ropa Exterior' 
  | 'Calzado' 
  | 'Accesorios' 
  | 'Pantalones' 
  | 'Polos y Camisas';

export type Currency = 'USD' | 'PEN';

export type CaptureAngle = 'frontal' | 'posterior' | 'detalle' | 'etiqueta';

export type ChannelId = 'shopify' | 'mercadolibre' | 'woocommerce' | 'amazon';

export interface ChannelInfo {
  id: ChannelId;
  name: string;
  badge: string;
  storeName: string;
  accentColor: string;
  badgeColor: string;
  description: string;
}

export interface ProductItem {
  id: string;
  skuParent: string;
  skuChild: string;
  condition: ProductCondition;
  name: string;
  category: ProductCategory;
  brand: string;
  material: string;
  size: string;
  color: string;
  price: number;
  currency: Currency;
  width: number; // cm
  height: number; // cm
  length: number; // cm
  description: string;
  channels: Record<ChannelId, boolean>;
  photos: Record<CaptureAngle, string | null>;
  publishedAt?: string;
  status: 'borrador' | 'listo' | 'sincronizado';
}

export interface HardwareStatus {
  connected: boolean;
  cameraName: string;
  latencyMs: number;
  lightingLux: number;
  scaleWeightKg: number;
  scannerConnected: boolean;
  calibrationDate: string;
}

export interface DispatchLog {
  step: number;
  title: string;
  detail: string;
  status: 'waiting' | 'in_progress' | 'success' | 'error';
  timestamp: string;
}

import React from 'react';
import { Header } from './components/Header';
import { ProductForm } from './components/ProductForm';
import { StudioCamera } from './components/StudioCamera';
import { PhotoGrid } from './components/PhotoGrid';
import { PublishPanel } from './components/PublishPanel';
import { DispatchModal } from './components/DispatchModal';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { EnlargeModal } from './components/EnlargeModal';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none antialiased">
      {/* Top Header Bar (h-14) */}
      <Header />

      {/* Main Viewport: 2-column split layout for warehouse touchscreen & desktop */}
      <main className="h-[calc(100vh-3.5rem)] grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
        
        {/* Left Section: Product Specification & SKU Form (7 Cols, overflow-y-auto pr-2) */}
        <section className="lg:col-span-7 h-full overflow-y-auto pr-2 pb-8 custom-scrollbar">
          <ProductForm />
        </section>

        {/* Right Section: Live Photo Studio & Multi-Channel Dispatch (5 Cols, flex flex-col gap-4) */}
        <section className="lg:col-span-5 h-full overflow-y-auto pr-1 pb-8 flex flex-col gap-4 custom-scrollbar">
          {/* Studio Camera Viewport */}
          <StudioCamera />

          {/* 4-Slot Photo Thumbnail Grid (2x2) */}
          <PhotoGrid />

          {/* Publication & Multi-Channel Sync CTA Panel */}
          <PublishPanel />
        </section>
      </main>

      {/* Interactive Modals */}
      <DispatchModal />
      <DiagnosticsModal />
      <EnlargeModal />
    </div>
  );
};

export default App;

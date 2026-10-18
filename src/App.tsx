import React from 'react';
import { Header } from './components/Header';
import { ProductForm } from './components/ProductForm';
import { PhotoStudioPanel } from './components/PhotoStudioPanel';
import { PublishPanel } from './components/PublishPanel';
import { CameraStudioModal } from './components/CameraStudioModal';
import { DispatchModal } from './components/DispatchModal';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { EnlargeModal } from './components/EnlargeModal';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none antialiased">
      {/* Top Header Bar (h-14) */}
      <Header />

      {/* Main Viewport: 2-column split layout for warehouse touchscreen & desktop */}
      <main className="h-[calc(100vh-3.5rem)] grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 overflow-hidden">
        
        {/* Left Section: Product Specification & SKU Form (7 Cols, overflow-y-auto pr-2) */}
        <section className="lg:col-span-7 h-full overflow-y-auto pr-1.5 pb-6">
          <ProductForm />
        </section>

        {/* Right Section: Photo Studio & Multi-Channel Dispatch (5 Cols, flex flex-col gap-4) */}
        <section className="lg:col-span-5 h-full overflow-y-auto pr-1 pb-6 flex flex-col gap-4">
          {/* Photo Studio Panel with 2x2 grid and camera modal button */}
          <PhotoStudioPanel />

          {/* Publication & Multi-Channel Sync CTA Panel */}
          <PublishPanel />
        </section>
      </main>

      {/* Interactive Modals */}
      <CameraStudioModal />
      <DispatchModal />
      <DiagnosticsModal />
      <EnlargeModal />
    </div>
  );
};

export default App;

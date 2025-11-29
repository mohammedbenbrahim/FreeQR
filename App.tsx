import React, { useState } from 'react';
import { Controls } from './components/Controls';
import { QRPreview } from './components/QRPreview';
import { QRConfig } from './types';
import { QrCode } from 'lucide-react';

const DEFAULT_CONFIG: QRConfig = {
  data: 'https://google.com',
  width: 300,
  height: 300,
  margin: 10,
  image: undefined,
  dotsOptions: {
    color: '#000000',
    type: 'rounded'
  },
  backgroundOptions: {
    color: '#ffffff',
  },
  cornersSquareOptions: {
    color: '#000000',
    type: 'extra-rounded'
  },
  cornersDotOptions: {
    color: '#000000',
    type: 'dot'
  },
  qrOptions: {
    errorCorrectionLevel: 'Q'
  },
  imageOptions: {
    crossOrigin: 'anonymous',
    margin: 5
  },
  frameOptions: {
    enabled: true,
    color: '#000000',
    width: 0,
    radius: 20
  },
  downloadOptions: {
    resolution: 2048
  }
};

export default function App() {
  const [config, setConfig] = useState<QRConfig>(DEFAULT_CONFIG);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                <QrCode size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-700 to-brand-500 tracking-tight">
              FreeQR
            </h1>
          </div>
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            High Quality QR Generator
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 xl:col-span-4 lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24">
             <Controls config={config} setConfig={setConfig} />
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-start pt-4 lg:pt-0">
            <div className="w-full max-w-md mx-auto lg:max-w-none lg:mx-0 sticky top-24">
                <div className="flex flex-col lg:flex-row items-start gap-8">
                     <div className="flex-1 w-full">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Create your custom QR Code</h2>
                            <p className="text-slate-500 text-lg">
                                Customize colors, shapes, and logos. Download in high-quality PNG or SVG instantly.
                            </p>
                        </div>
                        <QRPreview config={config} />
                     </div>
                     
                     {/* Info Sidebar (Desktop only) */}
                     <div className="hidden xl:block w-64 shrink-0 space-y-6 pt-20">
                        <div className="p-4 bg-brand-50 rounded-xl border border-brand-100">
                            <h3 className="font-semibold text-brand-800 mb-2 text-sm">Pro Tip</h3>
                            <p className="text-xs text-brand-600 leading-relaxed">
                                Always test your QR code with a scanner before printing to ensure the colors have enough contrast.
                            </p>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <h3 className="font-semibold text-slate-800 mb-2 text-sm">High Quality</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Downloads are rendered at up to 2048px resolution with vector support for perfect printing.
                            </p>
                        </div>
                     </div>
                </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} FreeQR – Free QR Code Generator Tool. Built with privacy in mind.
          </p>
        </div>
      </footer>
    </div>
  );
}
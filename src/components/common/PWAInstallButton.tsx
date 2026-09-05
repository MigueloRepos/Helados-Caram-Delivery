import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'nav' | 'banner' | 'floating' | 'compact' }> = ({
  variant = 'nav',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'compact') {
      return (
        <button
          onClick={install}
          title="Instalar App de Helados Caram"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5 animate-bounce" />
          <span>Instalar App</span>
        </button>
      );
    }

    if (variant === 'floating') {
      return (
        <div className="fixed top-20 right-4 z-40 animate-fade-in">
          <button
            onClick={install}
            className="glass-panel flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/90 text-rose-600 font-bold text-xs shadow-lg border border-rose-200/80 hover:bg-rose-50 transition-all active:scale-95"
          >
            <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center">
              <Download className="w-3.5 h-3.5" />
            </div>
            <span>Instalar Helados Caram</span>
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-rose-500/20 hover:from-rose-700 hover:to-rose-600 transition-all active:scale-95"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Instalar PWA</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-all"
        >
          <Smartphone className="w-3.5 h-3.5 text-rose-600" />
          <span>Instalar en iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-rose-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                    🍦
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Instalar en iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">1</span>
                  <span>Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">2</span>
                  <span>Desliza y selecciona <strong>"Agregar al inicio"</strong>.</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">3</span>
                  <span>Disfruta de Helados Caram a pantalla completa y sin barras de navegación.</span>
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-2xl bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 transition active:scale-95 shadow-lg shadow-rose-600/20"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

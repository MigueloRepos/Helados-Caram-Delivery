import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-600/95 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white shadow-xl border border-amber-400/30 animate-pulse">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Modo sin conexión — Mostrando catálogo guardado localmente</span>
    </div>
  );
};

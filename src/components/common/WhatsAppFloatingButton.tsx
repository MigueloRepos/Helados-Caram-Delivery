import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppGeneralUrl } from '../../utils/whatsapp';

export const WhatsAppFloatingButton: React.FC = () => {
  const url = getWhatsAppGeneralUrl();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp a Helados Caram"
      className="fixed bottom-20 md:bottom-6 right-4 z-40 flex items-center gap-2 rounded-full bg-emerald-500 p-3.5 md:px-4 md:py-3 text-white shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 transition-all active:scale-95 group"
    >
      <MessageCircle className="w-6 h-6 shrink-0 fill-current" />
      <span className="hidden md:inline font-bold text-xs">WhatsApp Caram</span>
    </a>
  );
};

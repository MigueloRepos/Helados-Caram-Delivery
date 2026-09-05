import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';

export const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50/70 transition"
        aria-label="Ver notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-200/80 z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Notificaciones</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Marcar leídas</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-2">
                  <Bell className="w-5 h-5 opacity-60" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Sin notificaciones</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Aquí verás los cambios de estado de tus pedidos.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-3.5 hover:bg-slate-50 transition cursor-pointer ${
                    !notif.is_read ? 'bg-rose-50/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">{notif.message}</p>
                  {notif.order_id && (
                    <Link
                      to={`/orders/${notif.order_id}`}
                      onClick={() => setIsOpen(false)}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                    >
                      <span>Ver seguimiento</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

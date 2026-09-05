import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => {
        let icon = <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />;
        let border = 'border-emerald-200';
        let bg = 'bg-white/95';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
          border = 'border-rose-200';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;
          border = 'border-blue-200';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl backdrop-blur-md border ${border} ${bg} transition-all duration-300 transform translate-y-0 opacity-100`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 leading-tight">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

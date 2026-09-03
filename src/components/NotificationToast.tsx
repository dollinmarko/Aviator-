import React from 'react';
import { ToastMessage } from '../types.ts';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
        let accentBorder = 'border-l-2 border-l-emerald-500';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-[#E30613] shrink-0" />;
          accentBorder = 'border-l-4 border-l-[#E30613]';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-[#D4AF37] shrink-0" />;
          accentBorder = 'border-l-4 border-l-[#D4AF37]';
        } else if (toast.type === 'info') {
          icon = <Info className="w-4 h-4 text-[#D4AF37] shrink-0" />;
          accentBorder = 'border-l-4 border-l-[#D4AF37]';
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 aviator-glass-card rounded-xl border border-[#D4AF37]/35 shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-300 animate-in slide-in-from-top-3 ${accentBorder}`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="text-xs font-mono font-medium text-white flex-1 leading-snug">
              {toast.message}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-white/60 hover:text-white p-1 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

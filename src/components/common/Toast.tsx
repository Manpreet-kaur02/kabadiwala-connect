import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      bg: 'bg-emerald-900/90 border-emerald-500/50 text-emerald-50',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-900/90 border-amber-500/50 text-amber-50',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    },
    info: {
      bg: 'bg-teal-900/90 border-teal-500/50 text-teal-50',
      icon: <Info className="w-5 h-5 text-teal-400 shrink-0" />,
    },
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-xl transition-all animate-in slide-in-from-bottom-3 ${config.bg}`}
      role="alert"
    >
      {config.icon}
      <div className="flex-1 text-sm">
        <p className="font-semibold">{toast.title}</p>
        {toast.description && <p className="text-xs mt-0.5 opacity-90">{toast.description}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/70 hover:text-white"
        aria-label="Close toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const Toast: React.FC<{
  message: string;
  type?: 'success' | 'warning' | 'info';
  onClose: () => void;
}> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: 'bg-emerald-900/95 border-emerald-500/50 text-emerald-50',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-900/95 border-amber-500/50 text-amber-50',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    },
    info: {
      bg: 'bg-teal-900/95 border-teal-500/50 text-teal-50',
      icon: <Info className="w-4 h-4 text-teal-400 shrink-0" />,
    },
  }[type];

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-3 fade-in">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl ${config.bg} text-xs font-semibold`}
        role="alert"
      >
        {config.icon}
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 p-1 hover:bg-white/10 rounded-md text-white/70 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};


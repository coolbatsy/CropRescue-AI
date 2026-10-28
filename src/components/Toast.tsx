import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
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

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-white border-emerald-200 text-gray-800 shadow-lg shadow-emerald-500/5',
    error: 'bg-white border-red-200 text-gray-800 shadow-lg shadow-red-500/5',
    info: 'bg-white border-blue-200 text-gray-800 shadow-lg shadow-blue-500/5',
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 p-3.5 rounded-xl border ${bgStyles[toast.type]} transition-all animate-in slide-in-from-bottom-2`}
    >
      {icons[toast.type]}
      <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-gray-600 p-0.5 rounded-md"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

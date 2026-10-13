import { useToast } from '@/store/useToast';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium animate-slide-up",
            toast.type === 'success' ? "bg-green-50 border-green-200 text-green-800" :
            toast.type === 'error' ? "bg-red-50 border-red-200 text-red-800" :
            "bg-blue-50 border-blue-200 text-blue-800"
          )}
        >
          {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
          {toast.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
          {toast.message}
          <button onClick={() => removeToast(toast.id)} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

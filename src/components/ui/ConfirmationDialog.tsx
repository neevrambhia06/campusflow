import { Button } from './Button';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  isDestructive?: boolean;
}

export function ConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  isDestructive = false 
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-fade-in">
        <div className="flex justify-between items-start p-6 pb-2">
          <div className="flex items-center gap-3">
            {isDestructive && (
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            )}
            <h2 className="text-xl font-display font-bold text-slate-900">{title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 pt-2 overflow-y-auto text-slate-600">
          <div className={isDestructive ? "ml-13" : ""}>
            {message}
          </div>
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            type="button" 
            variant={isDestructive ? "danger" : "default"} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

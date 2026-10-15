import { CheckCircle2, RotateCcw } from 'lucide-react';

interface NotificationEmptyStateProps {
  activeTab: 'all' | 'deadlines' | 'settings';
  hasDismissedItems: boolean;
  onRestore: () => void;
}

export function NotificationEmptyState({
  activeTab,
  hasDismissedItems,
  onRestore,
}: NotificationEmptyStateProps) {
  return (
    <div className="p-8 text-center text-slate-400">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-3">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-slate-700">All caught up!</p>
      <p className="text-xs text-slate-400 mt-1">
        {activeTab === 'deadlines'
          ? 'No experiments due in the next 3 days.'
          : 'No pending experiments needing attention.'}
      </p>
      {hasDismissedItems && (
        <button
          type="button"
          onClick={onRestore}
          className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors py-1.5 px-3 rounded-lg bg-indigo-50/80 hover:bg-indigo-100"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restore cleared notifications
        </button>
      )}
    </div>
  );
}

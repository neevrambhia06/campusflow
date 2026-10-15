import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { Assignment, Subject } from '@/types';

export interface NotificationAssignment extends Assignment {
  days: number;
  subject?: Subject;
}

interface NotificationItemProps {
  item: NotificationAssignment;
  onDismiss: (id: string, e: React.MouseEvent) => void;
  onSelect: () => void;
}

export function NotificationItem({ item, onDismiss, onSelect }: NotificationItemProps) {
  const isOverdue = item.days < 0;
  const isDueToday = item.days === 0;

  return (
    <Link
      to={`/assignments/${item.id}`}
      onClick={onSelect}
      className="flex items-start gap-3 p-3.5 rounded-xl hover:bg-slate-50 transition-colors group relative"
    >
      <div
        className={`p-2 rounded-xl shrink-0 mt-0.5 ${
          isOverdue
            ? 'bg-red-50 text-red-600'
            : isDueToday
            ? 'bg-amber-50 text-amber-600'
            : 'bg-indigo-50 text-indigo-600'
        }`}
      >
        {isOverdue ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
      </div>

      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold text-slate-900 truncate">
            {item.subject?.code || item.subject?.name || 'Subject'} · Exp {item.experimentNumber}
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
              isOverdue
                ? 'bg-red-100 text-red-700'
                : isDueToday
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isOverdue
              ? `${Math.abs(item.days)}d Overdue`
              : isDueToday
              ? 'Due Today'
              : `${item.days}d left`}
          </span>
        </div>
        <p className="text-xs text-slate-600 truncate">{item.title}</p>
      </div>

      <button
        type="button"
        onClick={(e) => onDismiss(item.id, e)}
        title="Dismiss alert"
        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-opacity absolute right-3 top-3.5"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </Link>
  );
}

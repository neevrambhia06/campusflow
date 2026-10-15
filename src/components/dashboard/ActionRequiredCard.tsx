import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { MagicBentoCard } from '@/components/ui/MagicBento';
import { Assignment, Subject, WorkflowStage, WORKFLOW_STAGE_LABELS } from '@/types';
import { getDaysRemaining, cn } from '@/utils';

interface ActionRequiredCardProps {
  assignments: Assignment[];
  subjects: Subject[];
}

const getStatusBadgeStyle = (status: WorkflowStage) => {
  switch (status) {
    case 'CORRECTION_REQUIRED':
      return 'bg-rose-50 text-rose-700 border-rose-200/80';
    case 'READY_FOR_UPLOAD':
      return 'bg-amber-50 text-amber-700 border-amber-200/80';
    case 'IN_PROGRESS':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
    case 'UPLOADED':
      return 'bg-sky-50 text-sky-700 border-sky-200/80';
    case 'FACULTY_CHECKING':
      return 'bg-purple-50 text-purple-700 border-purple-200/80';
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200/80';
  }
};

export function ActionRequiredCard({ assignments, subjects }: ActionRequiredCardProps) {
  return (
    <MagicBentoCard
      colSpan="md:col-span-2 lg:col-span-2"
      title="Action Required"
      description="Experiments requiring lab performance, template preparation, or correction."
      badge={`${assignments.length} Items`}
      badgeColor={
        assignments.length > 0
          ? 'bg-amber-50/90 text-amber-800 border-amber-200/80'
          : 'bg-emerald-50/90 text-emerald-800 border-emerald-200/80'
      }
      icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
    >
      <div className="mt-1 space-y-2.5">
        {assignments.length > 0 ? (
          assignments.slice(0, 4).map((a) => {
            const subject = subjects.find((s) => s.id === a.subjectId);
            const daysLeft = getDaysRemaining(a.dueDate);
            const isOverdue = daysLeft < 0;
            const isDueToday = daysLeft === 0;

            return (
              <Link
                key={a.id}
                to={`/assignments/${a.id}`}
                className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/70 bg-white hover:bg-slate-50/80 hover:border-indigo-300/80 hover:shadow-xs transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group block"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Subject Color Pill */}
                  <div
                    className={cn(
                      'w-2.5 h-10 rounded-full shrink-0 shadow-2xs',
                      subject?.color || 'bg-slate-300'
                    )}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                        {subject?.code || subject?.name?.substring(0, 4) || 'SUB'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 truncate">
                        Exp {a.experimentNumber}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {a.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                      a.status
                    )}`}
                  >
                    {WORKFLOW_STAGE_LABELS[a.status]}
                  </span>

                  <div
                    className={`text-xs font-semibold px-2.5 py-1 rounded-xl flex items-center gap-1.5 border shrink-0 ${
                      isOverdue
                        ? 'bg-rose-50/80 text-rose-700 border-rose-200/70'
                        : isDueToday
                        ? 'bg-amber-50/80 text-amber-700 border-amber-200/70'
                        : 'bg-slate-50 text-slate-600 border-slate-200/70'
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {isOverdue
                        ? `${Math.abs(daysLeft)}d overdue`
                        : isDueToday
                        ? 'Due Today'
                        : `${daysLeft}d left`}
                    </span>
                  </div>

                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors hidden sm:flex shrink-0">
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="p-8 text-center bg-emerald-50/40 rounded-2xl border border-emerald-100/80">
            <CheckCircle2 className="h-9 w-9 mx-auto text-emerald-600 mb-2" />
            <p className="font-bold text-slate-900 text-sm">Everything is under control! 🎉</p>
            <p className="text-xs text-slate-500 mt-0.5">
              No experiments currently require urgent action.
            </p>
          </div>
        )}
      </div>
    </MagicBentoCard>
  );
}

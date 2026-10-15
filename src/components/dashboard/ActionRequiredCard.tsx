import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { MagicBentoCard } from '@/components/ui/MagicBento';
import { Badge } from '@/components/ui/Badge';
import { Assignment, Subject, WorkflowStage, WORKFLOW_STAGE_LABELS } from '@/types';
import { getDaysRemaining, cn } from '@/utils';

interface ActionRequiredCardProps {
  assignments: Assignment[];
  subjects: Subject[];
}

const getStatusBadgeVariant = (status: WorkflowStage) => {
  switch (status) {
    case 'NOT_STARTED': return 'default';
    case 'IN_PROGRESS': return 'indigo';
    case 'READY_FOR_UPLOAD': return 'warning';
    case 'UPLOADED': return 'indigo';
    case 'FACULTY_CHECKING': return 'purple';
    case 'CORRECTION_REQUIRED': return 'error';
    case 'COMPLETED': return 'success';
    default: return 'default';
  }
};

export function ActionRequiredCard({ assignments, subjects }: ActionRequiredCardProps) {
  return (
    <MagicBentoCard
      colSpan="md:col-span-2 lg:col-span-2"
      title="Action Required Today"
      description="Experiments needing immediate write-up, template preparation, or correction."
      badge={`${assignments.length} Pending`}
      badgeColor={assignments.length > 0 ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"}
      icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
    >
      <div className="mt-2 space-y-3">
        {assignments.length > 0 ? (
          assignments.map((a) => {
            const subject = subjects.find((s) => s.id === a.subjectId);
            const daysLeft = getDaysRemaining(a.dueDate);

            return (
              <div
                key={a.id}
                className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div
                    className={cn(
                      'w-2 h-10 rounded-full shrink-0',
                      subject?.color || 'bg-slate-300'
                    )}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-semibold text-slate-500 truncate">
                        {subject?.name}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-900">
                        Exp {a.experimentNumber}
                      </span>
                    </div>
                    <Link
                      to={`/assignments/${a.id}`}
                      className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors block truncate"
                    >
                      {a.title}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  <Badge variant={getStatusBadgeVariant(a.status)} className="text-xs py-0.5">
                    {WORKFLOW_STAGE_LABELS[a.status]}
                  </Badge>
                  <div className={`text-xs font-semibold flex items-center justify-end gap-1 shrink-0 ${
                    daysLeft < 0 ? 'text-red-600' : daysLeft === 0 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    <Clock className="h-3 w-3" />
                    <span>{daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-slate-50/70 rounded-xl border border-slate-100">
            <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
            <p className="font-semibold text-slate-800 text-sm">You're all caught up! 🎉</p>
            <p className="text-xs text-slate-500 mt-0.5">No experiments currently require urgent action.</p>
          </div>
        )}
      </div>
    </MagicBentoCard>
  );
}

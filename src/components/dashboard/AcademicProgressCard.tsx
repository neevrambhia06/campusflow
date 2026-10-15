import { CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import { MagicBentoCard } from '@/components/ui/MagicBento';
import { Assignment } from '@/types';
import { getDaysRemaining } from '@/utils';

interface AcademicProgressCardProps {
  assignments: Assignment[];
}

export function AcademicProgressCard({ assignments }: AcademicProgressCardProps) {
  const completedAssignments = assignments.filter((a) => a.status === 'COMPLETED');
  const pendingAssignments = assignments.filter((a) => a.status !== 'COMPLETED');
  const overdueAssignments = assignments.filter(
    (a) => getDaysRemaining(a.dueDate) < 0 && a.status !== 'COMPLETED'
  );
  const percentage = Math.round(
    assignments.length ? (completedAssignments.length / assignments.length) * 100 : 0
  );

  return (
    <MagicBentoCard
      title="Semester Momentum"
      description="Overall syllabus completion rate."
      badge={`${percentage}% Complete`}
      badgeColor={
        percentage >= 75
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : 'bg-indigo-50 text-indigo-800 border-indigo-200'
      }
      icon={<TrendingUp className="h-5 w-5 text-indigo-600" />}
    >
      <div className="mt-2 flex flex-col justify-between h-full space-y-6">
        <div>
          {/* Big Percentage Number */}
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-4xl sm:text-5xl font-display font-black tracking-tight text-slate-900">
              {percentage}%
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {completedAssignments.length} of {assignments.length} done
            </span>
          </div>

          {/* Minimalist Gradient Progress Bar */}
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 rounded-full transition-all duration-700"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>

        {/* Minimalist 2-stat grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/70 flex items-center justify-center text-slate-500 shrink-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pending
              </p>
              <p className="text-base font-bold text-slate-900 leading-tight">
                {pendingAssignments.length}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white border border-rose-200/70 flex items-center justify-center text-rose-600 shrink-0">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                Overdue
              </p>
              <p className="text-base font-bold text-rose-700 leading-tight">
                {overdueAssignments.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MagicBentoCard>
  );
}

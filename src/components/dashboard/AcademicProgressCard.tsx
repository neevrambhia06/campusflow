import { CheckCircle2 } from 'lucide-react';
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
      title="Academic Progress"
      description="Overall completion across active semester courses."
      badge={`${percentage}%`}
      icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
    >
      <div className="mt-2 flex flex-col justify-between h-full">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-3xl font-display font-black text-slate-900">
              {completedAssignments.length}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              of {assignments.length} total experiments
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-5">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Pending</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">{pendingAssignments.length}</p>
          </div>
          <div className="p-3 bg-red-50/60 rounded-xl">
            <p className="text-[10px] text-red-500 uppercase tracking-wider font-bold">Overdue</p>
            <p className="text-lg font-bold text-red-600 mt-0.5">{overdueAssignments.length}</p>
          </div>
        </div>
      </div>
    </MagicBentoCard>
  );
}

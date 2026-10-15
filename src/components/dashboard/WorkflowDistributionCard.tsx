import { GitCommit } from 'lucide-react';
import { MagicBentoCard } from '@/components/ui/MagicBento';
import { Assignment } from '@/types';

interface WorkflowDistributionCardProps {
  assignments: Assignment[];
}

export function WorkflowDistributionCard({ assignments }: WorkflowDistributionCardProps) {
  const workflowCounts = assignments.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pipeline = [
    { step: '01', key: 'NOT_STARTED', label: 'Received', desc: 'Moodle notified' },
    { step: '02', key: 'IN_PROGRESS', label: 'Writing & Lab', desc: 'Active execution' },
    { step: '03', key: 'READY_FOR_UPLOAD', label: 'Template Ready', desc: 'File formatted' },
    { step: '04', key: 'UPLOADED', label: 'Uploaded', desc: 'Sent to portal' },
    { step: '05', key: 'FACULTY_CHECKING', label: 'Faculty Check', desc: 'Under review' },
    { step: '06', key: 'CORRECTION_REQUIRED', label: 'Correction', desc: 'Action needed' },
  ];

  return (
    <MagicBentoCard
      colSpan="md:col-span-2 lg:col-span-2"
      title="Experiment Pipeline"
      description="Visual flow of assignments from initial Moodle notice to faculty sign-off."
      badge="6 Stages"
      badgeColor="bg-slate-100 text-slate-700 border-slate-200"
      icon={<GitCommit className="h-5 w-5 text-indigo-600" />}
    >
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
        {pipeline.map((stage) => {
          const count = workflowCounts[stage.key] || 0;
          const isActive = count > 0;
          const isCorrection = stage.key === 'CORRECTION_REQUIRED' && count > 0;

          return (
            <div
              key={stage.key}
              className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between text-left group ${
                isCorrection
                  ? 'bg-rose-50/70 border-rose-200/90 text-rose-950'
                  : isActive
                  ? 'bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-xs shadow-2xs'
                  : 'bg-slate-50/50 border-slate-200/50 text-slate-400'
              }`}
            >
              {/* Top row: Stage step number and count badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200/60">
                  {stage.step}
                </span>

                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isCorrection
                      ? 'bg-rose-200/80 text-rose-800'
                      : isActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </div>

              {/* Title & Micro description */}
              <div>
                <h4
                  className={`text-xs font-bold tracking-tight line-clamp-1 ${
                    isCorrection
                      ? 'text-rose-900'
                      : isActive
                      ? 'text-slate-900 group-hover:text-indigo-600'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </MagicBentoCard>
  );
}

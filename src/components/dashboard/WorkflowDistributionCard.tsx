import { Layers } from 'lucide-react';
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

  const stages = [
    { key: 'NOT_STARTED', label: 'Received', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { key: 'READY_FOR_UPLOAD', label: 'Template', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { key: 'UPLOADED', label: 'Uploaded', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { key: 'FACULTY_CHECKING', label: 'Checking', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { key: 'CORRECTION_REQUIRED', label: 'Correction', color: 'bg-red-50 text-red-700 border-red-200' },
  ];

  return (
    <MagicBentoCard
      colSpan="md:col-span-2 lg:col-span-2"
      title="Workflow Stage Distribution"
      description="Realtime count of experiments in each submission phase."
      badge="Live Status"
      icon={<Layers className="h-5 w-5 text-indigo-600" />}
    >
      <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
        {stages.map((stage) => (
          <div
            key={stage.key}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all hover:scale-105 ${stage.color}`}
          >
            <span className="text-xl sm:text-2xl font-black">
              {workflowCounts[stage.key] || 0}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1 line-clamp-1">
              {stage.label}
            </span>
          </div>
        ))}
      </div>
    </MagicBentoCard>
  );
}

import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { formatDate } from '@/utils';

interface DashboardHeaderProps {
  studentName: string;
  onAddExperiment: () => void;
}

export function DashboardHeader({ studentName, onAddExperiment }: DashboardHeaderProps) {
  const today = new Date();

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            Academic Dashboard
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-medium">Realtime Cloud Sync Active</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900">
          Good morning, {studentName}
        </h1>
        <p className="mt-1 sm:mt-1.5 text-sm sm:text-base text-slate-500">
          Here's what needs your attention today, {formatDate(today.toISOString())}.
        </p>
      </div>
      <Button className="gap-2 w-full sm:w-auto shrink-0 shadow-sm" onClick={onAddExperiment}>
        <Plus className="h-4 w-4" />
        Add Experiment
      </Button>
    </div>
  );
}

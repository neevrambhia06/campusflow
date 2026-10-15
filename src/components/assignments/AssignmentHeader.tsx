import { ArrowLeft, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Assignment, Subject } from '@/types';

interface AssignmentHeaderProps {
  assignment: Assignment;
  subject: Subject;
  completedCount: number;
  totalCount: number;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMarkAllCompleted: () => void;
}

export function AssignmentHeader({
  assignment,
  subject,
  completedCount,
  totalCount,
  onBack,
  onEdit,
  onDelete,
  onMarkAllCompleted,
}: AssignmentHeaderProps) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assignments
      </button>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <Badge
            variant="secondary"
            className="px-3 py-1 text-sm font-semibold uppercase tracking-wider bg-indigo-50 text-[var(--color-primary)]"
          >
            {subject.name}
          </Badge>
          <span className="text-slate-400 font-medium">—</span>
          <span className="text-slate-600 font-medium">Experiment {assignment.experimentNumber}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight text-slate-900">
            {assignment.title}
          </h1>

          <div className="flex gap-2 sm:gap-3 shrink-0 flex-wrap w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 flex-1 sm:flex-initial justify-center"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" /> Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="gap-2 flex-1 sm:flex-initial justify-center"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>

            {completedCount < totalCount && (
              <Button
                onClick={onMarkAllCompleted}
                variant="outline"
                size="sm"
                className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 w-full sm:w-auto justify-center"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Mark all Completed
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

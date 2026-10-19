import { Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Assignment, Subject } from '@/types';

interface AssignmentHeaderProps {
  assignment: Assignment;
  subject: Subject;
  completedCount: number;
  totalCount: number;
  prevAssignment?: Assignment | null;
  nextAssignment?: Assignment | null;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMarkAllCompleted: () => void;
  onNavigateToAssignment?: (id: string) => void;
}

export function AssignmentHeader({
  assignment,
  subject,
  completedCount,
  totalCount,
  prevAssignment,
  nextAssignment,
  onBack,
  onEdit,
  onDelete,
  onMarkAllCompleted,
  onNavigateToAssignment,
}: AssignmentHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top Navigation Row: Back Button & Next/Prev Quick Switches */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/assignments"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Assignments</span>
        </Link>

        <div className="flex items-center gap-2">
          {prevAssignment && (
            <button
              type="button"
              onClick={() => onNavigateToAssignment?.(prevAssignment.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
              title={`Exp ${prevAssignment.experimentNumber}: ${prevAssignment.title}`}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Prev (Exp {prevAssignment.experimentNumber})</span>
              <span className="sm:hidden">Prev</span>
            </button>
          )}

          {nextAssignment && (
            <button
              type="button"
              onClick={() => onNavigateToAssignment?.(nextAssignment.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-xs font-bold text-white shadow-xs hover:shadow-sm transition-all"
              title={`Exp ${nextAssignment.experimentNumber}: ${nextAssignment.title}`}
            >
              <span>Next Experiment</span>
              <span className="hidden sm:inline"> (Exp {nextAssignment.experimentNumber})</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <Link
            to={`/subjects/${subject.id}`}
            title={`View all experiments in ${subject.name}`}
            className="inline-block transition-transform hover:scale-105"
          >
            <Badge
              variant="secondary"
              className="px-3 py-1 text-sm font-semibold uppercase tracking-wider bg-indigo-50 text-[var(--color-primary)] hover:bg-indigo-100/80 cursor-pointer transition-colors"
            >
              {subject.name}
            </Badge>
          </Link>
          <span className="text-slate-400 font-medium">—</span>
          <span className="text-slate-600 font-medium">Experiment {assignment.experimentNumber}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight text-slate-900">
            {assignment.title}
          </h1>

          <div className="flex gap-2 sm:gap-3 shrink-0 flex-wrap w-full sm:w-auto">
            {/* Direct Next Experiment Action Button */}
            {nextAssignment && (
              <Button
                onClick={() => onNavigateToAssignment?.(nextAssignment.id)}
                size="sm"
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex-1 sm:flex-initial justify-center shadow-xs"
              >
                <span>Next Experiment</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

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

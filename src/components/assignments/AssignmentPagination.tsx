import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Assignment } from '@/types';

interface AssignmentPaginationProps {
  prevAssignment?: Assignment | null;
  nextAssignment?: Assignment | null;
}

export function AssignmentPagination({
  prevAssignment,
  nextAssignment,
}: AssignmentPaginationProps) {
  if (!prevAssignment && !nextAssignment) return null;

  return (
    <div className="pt-6 border-t border-slate-200/80">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Previous Experiment Card */}
        {prevAssignment ? (
          <Link
            to={`/assignments/${prevAssignment.id}`}
            className="group p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center gap-3.5 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors shrink-0">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Previous Experiment
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                Exp {prevAssignment.experimentNumber}: {prevAssignment.title}
              </p>
            </div>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}

        {/* Next Experiment Card */}
        {nextAssignment ? (
          <Link
            to={`/assignments/${nextAssignment.id}`}
            className="group p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200/70 hover:bg-indigo-50/80 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center justify-between gap-3.5 text-right sm:col-start-2"
          >
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
                Next Experiment →
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                Exp {nextAssignment.experimentNumber}: {nextAssignment.title}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 group-hover:bg-indigo-700 transition-all shrink-0">
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800 text-center sm:col-start-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>You've reached the last experiment!</span>
          </div>
        )}
      </div>
    </div>
  );
}

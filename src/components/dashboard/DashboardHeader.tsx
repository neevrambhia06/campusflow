import { Plus, Sparkles, Calendar as CalendarIcon, CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';
import { formatDate } from '@/utils';
import { Assignment } from '@/types';
import { getDaysRemaining } from '@/utils';

interface DashboardHeaderProps {
  studentName: string;
  assignments: Assignment[];
  onAddExperiment: () => void;
}

export function DashboardHeader({
  studentName,
  assignments,
  onAddExperiment,
}: DashboardHeaderProps) {
  const today = new Date();

  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === 'COMPLETED').length;
  const inProgress = assignments.filter(
    (a) => a.status !== 'COMPLETED' && a.status !== 'NOT_STARTED'
  ).length;
  const needsAttention = assignments.filter(
    (a) =>
      a.status === 'CORRECTION_REQUIRED' ||
      (getDaysRemaining(a.dueDate) < 0 && a.status !== 'COMPLETED')
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Status Capsule */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50/80 text-indigo-700 border border-indigo-200/60 shadow-2xs">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              Academic Workspace
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <CalendarIcon className="h-3 w-3 text-slate-400" />
              {formatDate(today.toISOString())}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight text-slate-900">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-indigo-900">{studentName}</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
            Track your laboratory experiments, prepare Moodle templates, and keep up with submission deadlines.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onAddExperiment}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all hover:shadow-lg hover:shadow-indigo-600/25 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Experiment</span>
        </button>
      </div>

      {/* Sleek Minimalist Quick Metrics Bar */}
      {total > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Metric 1 */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.03)] hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Tracked
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
                <Layers className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
                {total}
              </span>
              <span className="text-xs text-slate-400 font-medium">experiments</span>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.03)] hover:border-indigo-200 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                In Progress
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Clock className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-display font-black text-indigo-950 tracking-tight">
                {inProgress}
              </span>
              <span className="text-xs text-slate-400 font-medium">underway</span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.03)] hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Completed
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-display font-black text-emerald-950 tracking-tight">
                {completed}
              </span>
              <span className="text-xs text-emerald-600 font-semibold">
                ({Math.round((completed / total) * 100)}%)
              </span>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.03)] hover:border-rose-200 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                Attention
              </span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
                {needsAttention}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {needsAttention === 1 ? 'item needs action' : 'items need action'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

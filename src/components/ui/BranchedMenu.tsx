import { useState } from 'react';
import { Subject, Assignment } from '@/types';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils';

interface BranchedMenuProps {
  subject: Subject;
  assignments: Assignment[];
  defaultExpanded?: boolean;
  className?: string;
}

export function BranchedMenu({
  subject,
  assignments,
  defaultExpanded = true,
  className = '',
}: BranchedMenuProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const completedCount = assignments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className={`relative ${className}`}>
      {/* Root Node: Subject */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer select-none group"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Subject Color Pill */}
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-2xs shrink-0',
              subject.color || 'bg-indigo-600'
            )}
          >
            {(subject.code || subject.name).substring(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors truncate">
                {subject.name}
              </h3>
              {subject.code && (
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {subject.code}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {subject.semester} {subject.faculty ? `• Prof. ${subject.faculty}` : ''}
            </p>
          </div>
        </div>

        {/* Right side stats + Chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-slate-700">
              {completedCount} / {assignments.length} Done
            </span>
            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{
                  width: `${assignments.length ? (completedCount / assignments.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-slate-700 group-hover:bg-slate-100 transition-colors">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </div>
      </div>

      {/* Branching Lines & Child Experiment Nodes */}
      {isExpanded && (
        <div className="relative pl-6 sm:pl-8 pt-3 pb-1 space-y-2.5 animate-fade-in">
          {/* Vertical Trunk Line */}
          <div className="absolute left-5 sm:left-7 top-0 bottom-4 w-0.5 bg-indigo-200/80 rounded-full" />

          {assignments.length > 0 ? (
            assignments.map((assignment) => {
              const isCompleted = assignment.status === 'COMPLETED';

              return (
                <div key={assignment.id} className="relative flex items-center group">
                  {/* Curved Branching Line from Trunk to Node */}
                  <svg
                    className="absolute -left-6 sm:-left-8 top-1/2 -translate-y-1/2 w-6 sm:w-8 h-6 pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M0 0 V12 Q0 24 12 24 H24"
                      stroke="#c7d2fe"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle cx="20" cy="24" r="2.5" fill="#6366f1" />
                  </svg>

                  {/* Experiment Leaf Card */}
                  <Link
                    to={`/assignments/${assignment.id}`}
                    className="flex-1 flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50/90 hover:bg-indigo-50/50 border border-slate-200/70 hover:border-indigo-200 transition-all shadow-2xs group-hover:translate-x-1"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <span>{assignment.experimentNumber}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          Exp {assignment.experimentNumber}: {assignment.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          Due: {assignment.dueDate || 'No deadline'}
                        </p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="shrink-0 ml-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : assignment.status === 'CORRECTION_REQUIRED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isCompleted
                          ? 'Completed'
                          : assignment.status === 'CORRECTION_REQUIRED'
                          ? 'Correction'
                          : 'In Progress'}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })
          ) : (
            <div className="relative flex items-center">
              <svg
                className="absolute -left-6 sm:-left-8 top-1/2 -translate-y-1/2 w-6 sm:w-8 h-6 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M0 0 V12 Q0 24 12 24 H24"
                  stroke="#c7d2fe"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
              <div className="flex-1 p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400 text-center">
                No experiments created for this subject yet.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

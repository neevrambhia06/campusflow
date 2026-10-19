import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ListChecks, 
  CheckCircle2, 
  ArrowRight, 
  Calendar 
} from 'lucide-react';
import { MagicBentoCard } from '@/components/ui/MagicBento';
import { Badge } from '@/components/ui/Badge';
import { Assignment, Subject } from '@/types';
import { 
  cn, 
  formatDate, 
  getDaysRemaining, 
  getAssignmentChecklistStatus 
} from '@/utils';

interface ChecklistFilterCardProps {
  assignments: Assignment[];
  subjects: Subject[];
}

type FilterOption = 'ALL_PENDING' | 'moodleReceived' | 'experimentWritten' | 'experimentPerformed' | 'templatePrepared' | 'uploadedToMoodle' | 'facultyChecked' | 'COMPLETED';

export function ChecklistFilterCard({ assignments, subjects }: ChecklistFilterCardProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('ALL_PENDING');

  // Compute status for all assignments once
  const assignmentsWithStatus = useMemo(() => {
    return assignments.map((a) => ({
      assignment: a,
      subject: subjects.find((s) => s.id === a.subjectId),
      statusInfo: getAssignmentChecklistStatus(a),
    }));
  }, [assignments, subjects]);

  // Overall syllabus completion
  const totalCount = assignments.length;
  const completedCount = assignmentsWithStatus.filter((item) => item.statusInfo.isCompleted).length;
  const pendingCount = totalCount - completedCount;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Compute count for each checklist filter
  const filterCounts = useMemo(() => {
    const counts: Record<FilterOption, number> = {
      ALL_PENDING: pendingCount,
      moodleReceived: 0,
      experimentWritten: 0,
      experimentPerformed: 0,
      templatePrepared: 0,
      uploadedToMoodle: 0,
      facultyChecked: 0,
      COMPLETED: completedCount,
    };

    assignmentsWithStatus.forEach((item) => {
      if (!item.statusInfo.isCompleted && item.statusInfo.pendingKey) {
        counts[item.statusInfo.pendingKey] = (counts[item.statusInfo.pendingKey] || 0) + 1;
      }
    });

    return counts;
  }, [assignmentsWithStatus, pendingCount, completedCount]);

  // Filtered experiments based on selected filter
  const filteredItems = useMemo(() => {
    let result = assignmentsWithStatus;

    if (activeFilter === 'ALL_PENDING') {
      result = result.filter((item) => !item.statusInfo.isCompleted);
    } else if (activeFilter === 'COMPLETED') {
      result = result.filter((item) => item.statusInfo.isCompleted);
    } else {
      result = result.filter(
        (item) => !item.statusInfo.isCompleted && item.statusInfo.pendingKey === activeFilter
      );
    }

    // Sort by due date (earliest due first)
    return result.sort(
      (a, b) => new Date(a.assignment.dueDate).getTime() - new Date(b.assignment.dueDate).getTime()
    );
  }, [assignmentsWithStatus, activeFilter]);

  const filterTabs: Array<{ id: FilterOption; label: string; count: number; stepNum?: string }> = [
    { id: 'ALL_PENDING', label: 'All Pending', count: filterCounts.ALL_PENDING },
    { id: 'moodleReceived', label: 'Receive Assignment', count: filterCounts.moodleReceived, stepNum: '01' },
    { id: 'experimentWritten', label: 'Write Experiment', count: filterCounts.experimentWritten, stepNum: '02' },
    { id: 'experimentPerformed', label: 'Perform Experiment', count: filterCounts.experimentPerformed, stepNum: '03' },
    { id: 'templatePrepared', label: 'Prepare Template', count: filterCounts.templatePrepared, stepNum: '04' },
    { id: 'uploadedToMoodle', label: 'Upload to Moodle', count: filterCounts.uploadedToMoodle, stepNum: '05' },
    { id: 'facultyChecked', label: 'Faculty Check', count: filterCounts.facultyChecked, stepNum: '06' },
    { id: 'COMPLETED', label: 'Completed', count: filterCounts.COMPLETED },
  ];

  return (
    <MagicBentoCard
      colSpan="md:col-span-2 lg:col-span-3"
      title="Checklist Workflow Hub"
      description="Track and filter all experiments by their active pending milestone in the 6-step checklist."
      badge={`${pendingCount} Pending • ${percentage}% Done`}
      badgeColor="bg-indigo-50/90 text-indigo-700 border-indigo-200/80"
      icon={<ListChecks className="h-5 w-5 text-indigo-600" />}
    >
      <div className="mt-3 space-y-4">
        {/* Progress & Milestone Overview Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Overall Progress</span>
              <span className="text-xs font-extrabold text-indigo-600 font-mono">
                {percentage}%
              </span>
            </div>
            <div className="w-32 sm:w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              {pendingCount} Active Lab Tasks
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {completedCount} Completed
            </span>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            const isCompletedTab = tab.id === 'COMPLETED';

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 select-none shadow-2xs',
                  isActive
                    ? isCompletedTab
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
                )}
              >
                {tab.stepNum && (
                  <span
                    className={cn(
                      'text-[9px] font-mono px-1 rounded',
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {tab.stepNum}
                  </span>
                )}
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-extrabold',
                    isActive
                      ? 'bg-white/25 text-white'
                      : tab.count > 0
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-slate-100 text-slate-400'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filtered Experiments Grid */}
        <div className="pt-1">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredItems.slice(0, 6).map(({ assignment, subject, statusInfo }) => {
                const daysLeft = getDaysRemaining(assignment.dueDate);
                const isOverdue = daysLeft < 0 && !statusInfo.isCompleted;
                const isDueToday = daysLeft === 0 && !statusInfo.isCompleted;

                return (
                  <Link
                    key={assignment.id}
                    to={`/assignments/${assignment.id}`}
                    className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50/80 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3 group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3 min-w-0">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Subject Initial/Pill */}
                        <div
                          className={cn(
                            'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-2xs',
                            statusInfo.isCompleted
                              ? 'bg-emerald-600'
                              : subject?.color || 'bg-indigo-600'
                          )}
                        >
                          {statusInfo.isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span>{assignment.experimentNumber}</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {subject?.code || 'COURSE'}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs font-semibold text-slate-500 truncate">
                              {subject?.name}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            Exp {assignment.experimentNumber}: {assignment.title}
                          </h4>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <Badge
                        variant={statusInfo.variant}
                        className="text-[10px] px-2 py-0.5 font-bold shrink-0 shadow-2xs"
                      >
                        {statusInfo.label}
                      </Badge>
                    </div>

                    {/* Bottom Row: Due Date & Days Remaining */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatDate(assignment.dueDate)}</span>
                        <span>•</span>
                        <span
                          className={cn(
                            'font-bold',
                            statusInfo.isCompleted
                              ? 'text-emerald-600'
                              : isOverdue
                              ? 'text-red-600'
                              : isDueToday
                              ? 'text-amber-600'
                              : 'text-slate-500'
                          )}
                        >
                          {statusInfo.isCompleted
                            ? 'Completed'
                            : isOverdue
                            ? `Overdue (${Math.abs(daysLeft)}d)`
                            : isDueToday
                            ? 'Due Today'
                            : `${daysLeft}d left`}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Clean Empty State */
            <div className="p-8 sm:p-10 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
              <CheckCircle2 className="h-9 w-9 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-bold text-slate-800">
                {activeFilter === 'COMPLETED'
                  ? 'No completed experiments yet'
                  : 'All caught up for this milestone! 🎉'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {activeFilter === 'COMPLETED'
                  ? 'Complete all 6 checklist items on an experiment to see it here.'
                  : `None of your experiments are currently waiting on "${filterTabs.find((t) => t.id === activeFilter)?.label}".`}
              </p>
            </div>
          )}

          {/* Footer Navigation link if more than 6 items */}
          {filteredItems.length > 6 && (
            <div className="pt-3 text-center">
              <Link
                to="/assignments"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span>View all {filteredItems.length} experiments in Assignments page</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </MagicBentoCard>
  );
}

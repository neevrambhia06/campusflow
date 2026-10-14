import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MagicBentoGrid, MagicBentoCard } from '@/components/ui/MagicBento';
import { Plus, Clock, CheckCircle2, AlertCircle, Calendar, Layers } from 'lucide-react';
import { formatDate, getDaysRemaining, cn } from '@/utils';
import { WORKFLOW_STAGE_LABELS, WorkflowStage } from '@/types';
import { Link } from 'react-router-dom';
import { ExperimentFormModal } from '@/components/assignments/ExperimentFormModal';

const getStatusBadgeVariant = (status: WorkflowStage) => {
  switch (status) {
    case 'NOT_STARTED': return 'default';
    case 'IN_PROGRESS': return 'indigo';
    case 'READY_FOR_UPLOAD': return 'warning';
    case 'UPLOADED': return 'indigo';
    case 'FACULTY_CHECKING': return 'purple';
    case 'CORRECTION_REQUIRED': return 'error';
    case 'COMPLETED': return 'success';
    default: return 'default';
  }
};

export function Dashboard() {
  const { assignments, subjects } = useStore();
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const pendingAssignments = assignments.filter(a => a.status !== 'COMPLETED');
  const completedAssignments = assignments.filter(a => a.status === 'COMPLETED');
  
  const attentionNeeded = assignments.filter(a => 
    a.status === 'CORRECTION_REQUIRED' || 
    a.status === 'READY_FOR_UPLOAD' || 
    (getDaysRemaining(a.dueDate) <= 3 && a.status !== 'COMPLETED' && a.status !== 'FACULTY_CHECKING')
  ).sort((a, b) => getDaysRemaining(a.dueDate) - getDaysRemaining(b.dueDate));

  const upcomingDeadlines = assignments
    .filter(a => a.status !== 'COMPLETED' && new Date(a.dueDate) >= today && new Date(a.dueDate) <= nextWeek)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const workflowCounts = assignments.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const studentName = user?.name || 'Neev';

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
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
        <Button className="gap-2 w-full sm:w-auto shrink-0 shadow-sm" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Experiment
        </Button>
      </div>

      <ExperimentFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      {assignments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-16 text-center text-slate-500 shadow-xs">
          <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4 animate-bounce" />
          <p className="text-xl font-bold text-slate-800 mb-2">You're all caught up!</p>
          <p className="text-sm mb-6 max-w-md mx-auto text-slate-500">
            No assignments have been added yet. Add your first college experiment to start tracking its full submission cycle.
          </p>
          <Button className="gap-2 w-full sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Experiment
          </Button>
        </div>
      ) : (
        /* React Bits Magic Bento Grid Layout */
        <MagicBentoGrid>
          {/* Card 1: Action Required Today (Large 2-column bento card) */}
          <MagicBentoCard
            colSpan="md:col-span-2 lg:col-span-2"
            title="Action Required Today"
            description="Experiments needing immediate write-up, template preparation, or correction."
            badge={`${attentionNeeded.length} Pending`}
            badgeColor={attentionNeeded.length > 0 ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"}
            icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
          >
            <div className="mt-2 space-y-3">
              {attentionNeeded.length > 0 ? (
                attentionNeeded.map((a) => {
                  const subject = subjects.find((s) => s.id === a.subjectId);
                  const daysLeft = getDaysRemaining(a.dueDate);

                  return (
                    <div
                      key={a.id}
                      className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div
                          className={cn(
                            'w-2 h-10 rounded-full shrink-0',
                            subject?.color || 'bg-slate-300'
                          )}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-semibold text-slate-500 truncate">
                              {subject?.name}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs sm:text-sm font-semibold text-slate-900">
                              Exp {a.experimentNumber}
                            </span>
                          </div>
                          <Link
                            to={`/assignments/${a.id}`}
                            className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors block truncate"
                          >
                            {a.title}
                          </Link>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                        <Badge variant={getStatusBadgeVariant(a.status)} className="text-xs py-0.5">
                          {WORKFLOW_STAGE_LABELS[a.status]}
                        </Badge>
                        <div className={`text-xs font-semibold flex items-center justify-end gap-1 shrink-0 ${
                          daysLeft < 0 ? 'text-red-600' : daysLeft === 0 ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          <Clock className="h-3 w-3" />
                          <span>{daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-slate-50/70 rounded-xl border border-slate-100">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                  <p className="font-semibold text-slate-800 text-sm">You're all caught up! 🎉</p>
                  <p className="text-xs text-slate-500 mt-0.5">No experiments currently require urgent action.</p>
                </div>
              )}
            </div>
          </MagicBentoCard>

          {/* Card 2: Academic Progress & Stats */}
          <MagicBentoCard
            title="Academic Progress"
            description="Overall completion across active semester courses."
            badge={`${Math.round(assignments.length ? (completedAssignments.length / assignments.length) * 100 : 0)}%`}
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
                      width: `${assignments.length ? (completedAssignments.length / assignments.length) * 100 : 0}%`,
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
                  <p className="text-lg font-bold text-red-600 mt-0.5">
                    {assignments.filter(a => getDaysRemaining(a.dueDate) < 0 && a.status !== 'COMPLETED').length}
                  </p>
                </div>
              </div>
            </div>
          </MagicBentoCard>

          {/* Card 3: Workflow Stage Overview */}
          <MagicBentoCard
            colSpan="md:col-span-2 lg:col-span-2"
            title="Workflow Stage Distribution"
            description="Realtime count of experiments in each submission phase."
            badge="Live Status"
            icon={<Layers className="h-5 w-5 text-indigo-600" />}
          >
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
              {[
                { key: 'NOT_STARTED', label: 'Received', color: 'bg-slate-100 text-slate-700 border-slate-200' },
                { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { key: 'READY_FOR_UPLOAD', label: 'Template', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                { key: 'UPLOADED', label: 'Uploaded', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                { key: 'FACULTY_CHECKING', label: 'Checking', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                { key: 'CORRECTION_REQUIRED', label: 'Correction', color: 'bg-red-50 text-red-700 border-red-200' },
              ].map((stage) => (
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

          {/* Card 4: Upcoming Deadlines This Week */}
          <MagicBentoCard
            title="Upcoming Deadlines"
            description="Experiments due within the next 7 days."
            badge="Next 7 Days"
            icon={<Calendar className="h-5 w-5 text-indigo-600" />}
          >
            <div className="mt-2 space-y-3">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.slice(0, 3).map((a) => {
                  const subject = subjects.find((s) => s.id === a.subjectId);
                  return (
                    <Link
                      key={a.id}
                      to={`/assignments/${a.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group block"
                    >
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl flex flex-col items-center justify-center shrink-0 text-white shadow-2xs',
                          subject?.color || 'bg-slate-400'
                        )}
                      >
                        <span className="text-[9px] font-bold uppercase leading-none">
                          {new Date(a.dueDate).toLocaleString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-xs font-black leading-none mt-0.5">
                          {new Date(a.dueDate).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {a.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {subject?.name} · Exp {a.experimentNumber}
                        </p>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">
                  No upcoming deadlines in the next 7 days.
                </p>
              )}
            </div>
          </MagicBentoCard>
        </MagicBentoGrid>
      )}
    </div>
  );
}

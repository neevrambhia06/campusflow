import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
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

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900">Good morning, Neev</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-500">Here's what needs your attention today, {formatDate(today.toISOString())}.</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto shrink-0" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Experiment
        </Button>
      </div>

      <ExperimentFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {assignments.length === 0 ? (
          <div className="md:col-span-3">
            <Card className="bg-slate-50/50 border-dashed">
              <CardContent className="p-8 sm:p-16 text-center text-slate-500">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-400 mb-4" />
                <p className="text-xl font-medium text-slate-700 mb-2">You're all caught up!</p>
                <p className="text-sm mb-6">No assignments have been added yet.</p>
                <Button className="gap-2 w-full sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Experiment
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Today's Focus - takes 2 columns */}
            <div className="md:col-span-2 space-y-6">
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Action Required
                </h2>
                <div className="space-y-3">
                  {attentionNeeded.length > 0 ? attentionNeeded.map(a => {
                    const subject = subjects.find(s => s.id === a.subjectId);
                    return (
                      <Card key={a.id} className="hover:shadow-md transition-shadow border-l-4 border-l-[var(--color-primary)]">
                        <CardContent className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className={cn("w-2 h-10 rounded-full shrink-0", subject?.color || "bg-slate-200")} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs sm:text-sm font-semibold text-slate-500 truncate">{subject?.name}</span>
                                <span className="text-sm text-slate-400">•</span>
                                <span className="text-xs sm:text-sm font-medium text-slate-900">Exp {a.experimentNumber}</span>
                              </div>
                              <Link to={`/assignments/${a.id}`} className="text-sm sm:text-base font-semibold text-[var(--color-primary)] hover:underline block truncate">
                                {a.title}
                              </Link>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                            <Badge variant={getStatusBadgeVariant(a.status)} className="text-xs py-0.5">
                              {WORKFLOW_STAGE_LABELS[a.status]}
                            </Badge>
                            <div className="text-xs text-slate-500 flex items-center justify-end gap-1 shrink-0">
                              <Clock className="h-3 w-3" />
                              {getDaysRemaining(a.dueDate)} days left
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  }) : (
                    <Card className="bg-slate-50/50 border-dashed">
                      <CardContent className="p-8 text-center text-slate-500">
                        <CheckCircle2 className="h-8 w-8 mx-auto text-green-400 mb-3" />
                        <p className="font-medium text-slate-700">You're all caught up! 🎉</p>
                        <p className="text-sm mt-1">No experiments currently need your attention.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Workflow Overview</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                      {[
                        { key: 'NOT_STARTED', color: 'bg-slate-200 text-slate-700' },
                        { key: 'IN_PROGRESS', color: 'bg-blue-100 text-blue-700' },
                        { key: 'READY_FOR_UPLOAD', color: 'bg-amber-100 text-amber-700' },
                        { key: 'UPLOADED', color: 'bg-indigo-100 text-indigo-700' },
                        { key: 'FACULTY_CHECKING', color: 'bg-purple-100 text-purple-700' },
                        { key: 'CORRECTION_REQUIRED', color: 'bg-red-100 text-red-700' },
                      ].map((stage) => (
                        <div key={stage.key} className="flex flex-col items-center flex-1 min-w-[80px]">
                          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-2", stage.color)}>
                            {workflowCounts[stage.key] || 0}
                          </div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 text-center tracking-wider h-8">
                            {stage.key.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>Academic Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-3xl font-display font-bold text-slate-900">{completedAssignments.length}</div>
                    <div className="text-sm font-medium text-slate-500 mb-1">/ {assignments.length} total</div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${assignments.length ? (completedAssignments.length / assignments.length) * 100 : 0}%` }} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Pending</p>
                      <p className="text-xl font-semibold text-slate-900">{pendingAssignments.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Overdue</p>
                      <p className="text-xl font-semibold text-red-600">
                        {assignments.filter(a => getDaysRemaining(a.dueDate) < 0 && a.status !== 'COMPLETED').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingDeadlines.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingDeadlines.slice(0, 4).map(a => {
                        const subject = subjects.find(s => s.id === a.subjectId);
                        return (
                          <div key={a.id} className="flex items-start gap-3">
                            <div className={cn("w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0", subject?.color || 'bg-slate-200', "text-white")}>
                              <span className="text-[10px] font-bold uppercase">{new Date(a.dueDate).toLocaleString('en-US', { month: 'short' })}</span>
                              <span className="text-sm font-bold leading-none">{new Date(a.dueDate).getDate()}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 line-clamp-1">{a.title}</p>
                              <p className="text-xs text-slate-500">{subject?.name} - Exp {a.experimentNumber}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No deadlines in the next 7 days.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>Submission Readiness</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="text-slate-700">Mid-Term</span>
                      <span className="text-slate-900">{completedAssignments.length} / {Math.ceil(assignments.length / 2) || 0}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (completedAssignments.length / Math.ceil(assignments.length / 2)) * 100) || 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="text-slate-700">Final</span>
                      <span className="text-slate-900">{completedAssignments.length} / {assignments.length}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full opacity-50" style={{ width: `${assignments.length ? (completedAssignments.length / assignments.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

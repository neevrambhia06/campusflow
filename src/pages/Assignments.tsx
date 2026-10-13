import { useState } from 'react';
import { useStore, ALL_SEMESTERS } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WORKFLOW_STAGE_LABELS, WorkflowStage } from '@/types';
import { formatDate, getDaysRemaining, cn } from '@/utils';
import { ExperimentFormModal } from '@/components/assignments/ExperimentFormModal';

export function Assignments() {
  const { assignments, subjects } = useStore();
  const [statusFilter, setStatusFilter] = useState<WorkflowStage | 'ALL'>('ALL');
  const [semesterFilter, setSemesterFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const filteredAssignments = assignments
    .filter(a => statusFilter === 'ALL' || a.status === statusFilter)
    .filter(a => {
      if (semesterFilter === 'ALL') return true;
      const subject = subjects.find(s => s.id === a.subjectId);
      return subject?.semester === semesterFilter;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());


  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-slate-900">Assignments</h1>
          <p className="mt-2 text-slate-500">Track every experiment from Moodle to faculty approval.</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Experiment
        </Button>
      </div>

      <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-soft">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-500">Semester:</span>
            <select 
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="rounded-md border border-slate-200 p-1.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Semesters</option>
              {ALL_SEMESTERS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-1 pt-2 border-t border-slate-100">
          {['ALL', ...Object.keys(WORKFLOW_STAGE_LABELS)].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors",
                statusFilter === status 
                  ? "bg-slate-800 text-white" 
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {status === 'ALL' ? 'All Statuses' : WORKFLOW_STAGE_LABELS[status as WorkflowStage]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft overflow-hidden">
        {filteredAssignments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredAssignments.map(a => {
              const subject = subjects.find(s => s.id === a.subjectId);
              const checklist = a.checklist || { moodleReceived: false, experimentPerformed: false, templatePrepared: false, uploadedToMoodle: false, facultyChecked: false };
              const completedCount = Object.values(checklist).filter(Boolean).length;
              const progress = (completedCount / 5) * 100;
              
              return (
                <Link 
                  to={`/assignments/${a.id}`} 
                  key={a.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-lg", subject?.color || "bg-slate-200")}>
                      {(subject?.code || subject?.name || 'S').substring(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-500">{subject?.name}</span>
                        <span className="text-sm text-slate-400">•</span>
                        <span className="text-sm font-medium text-slate-900">Exp {a.experimentNumber}</span>
                        {a.priority === 'high' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 ml-2">HIGH</span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-[var(--color-primary)] transition-colors">{a.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full sm:w-auto">
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5 justify-end mb-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {formatDate(a.dueDate)}
                      </p>
                      <p className={cn("text-xs font-semibold", getDaysRemaining(a.dueDate) < 0 ? "text-red-600" : "text-slate-500")}>
                        {getDaysRemaining(a.dueDate) < 0 ? 'Overdue' : `${getDaysRemaining(a.dueDate)} days left`}
                      </p>
                    </div>
                    
                    <div className="w-32 flex flex-col items-end justify-center">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{completedCount} / 5 completed</p>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--color-primary)] rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      {a.status === 'CORRECTION_REQUIRED' && (
                        <Badge variant="error" className="mt-2 text-[10px] px-1.5 py-0">Correction</Badge>
                      )}
                    </div>

                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[var(--color-primary)] transition-colors hidden sm:block" />
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500 bg-slate-50/50">
            <p className="text-xl font-medium text-slate-700 mb-2">No experiments yet.</p>
            <p className="text-sm mb-6">Add an experiment to start tracking your workflow.</p>
            <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Experiment
            </Button>
          </div>
        )}
      </div>

      <ExperimentFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}

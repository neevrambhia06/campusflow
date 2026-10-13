import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useToast } from '@/store/useToast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, ChevronRight } from 'lucide-react';
import { ExperimentFormModal } from '@/components/assignments/ExperimentFormModal';
import { SubjectFormModal } from '@/components/subjects/SubjectFormModal';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { WORKFLOW_STAGE_LABELS, WorkflowStage } from '@/types';
import { formatDate, getDaysRemaining, cn } from '@/utils';

export function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { subjects, assignments, deleteSubject } = useStore();
  const { addToast } = useToast();

  const [isAddExpOpen, setIsAddExpOpen] = useState(false);
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [isDeleteSubjectOpen, setIsDeleteSubjectOpen] = useState(false);

  const subject = subjects.find(s => s.id === id);
  const subjectAssignments = assignments
    .filter(a => a.subjectId === id)
    .sort((a, b) => a.experimentNumber - b.experimentNumber);

  if (!subject) {
    return <div className="p-8 text-center">Subject not found</div>;
  }

  const completed = subjectAssignments.filter(a => a.status === 'COMPLETED').length;
  const progress = subjectAssignments.length ? Math.round((completed / subjectAssignments.length) * 100) : 0;

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

  const handleDeleteSubject = () => {
    deleteSubject(subject.id);
    addToast("Subject and its experiments deleted successfully.");
    navigate('/subjects');
  };

  return (
    <div className="space-y-8 pb-10">
      <button 
        onClick={() => navigate('/subjects')}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Subjects
      </button>

      <div className="bg-white rounded-xl shadow-soft border border-slate-100 overflow-hidden">
        <div className={cn("h-3 w-full", subject.color)} />
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <Badge variant="secondary" className="px-3 py-1 text-sm font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                  {subject.semester}
                </Badge>
                {subject.faculty && (
                  <>
                    <span className="text-slate-300 font-medium">—</span>
                    <span className="text-slate-600 font-medium text-xs sm:text-sm">Faculty: {subject.faculty}</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 mb-2">
                {subject.name}
              </h1>
              <p className="text-slate-500 font-medium text-sm">Code: {subject.code}</p>
              {subject.description && (
                <p className="text-slate-600 mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base">{subject.description}</p>
              )}
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-4 shrink-0 w-full md:w-auto">
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-initial justify-center" onClick={() => setIsEditSubjectOpen(true)}>
                  <Edit className="h-4 w-4" /> Edit
                </Button>
                <Button variant="danger" size="sm" className="gap-2 flex-1 sm:flex-initial justify-center" onClick={() => setIsDeleteSubjectOpen(true)}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
              
              <div className="text-left md:text-right w-full">
                <div className="flex justify-between items-center gap-4 mb-1">
                  <span className="text-xs sm:text-sm font-semibold text-slate-500">{subjectAssignments.length} Experiments</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{progress}% Complete</span>
                </div>
                <div className="h-2 w-full md:w-48 bg-slate-100 rounded-full overflow-hidden ml-auto">
                  <div className={cn("h-full rounded-full transition-all duration-500", subject.color)} style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-slate-900">Experiments</h2>
          <Button className="gap-2 w-full sm:w-auto shrink-0" onClick={() => setIsAddExpOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Experiment
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-soft overflow-hidden">
          {subjectAssignments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {subjectAssignments.map(a => (
                <Link 
                  to={`/assignments/${a.id}`} 
                  key={a.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0 min-w-0">
                    <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-base sm:text-lg shadow-2xs", subject.color)}>
                      {a.experimentNumber}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">{a.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {a.priority === 'high' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">HIGH</span>
                        )}
                        <span className="text-xs text-slate-500">Exp {a.experimentNumber}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right shrink-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-900 flex items-center gap-1.5 sm:justify-end mb-0.5 sm:mb-1">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                        {formatDate(a.dueDate)}
                      </p>
                      <p className={cn("text-xs font-semibold", getDaysRemaining(a.dueDate) < 0 && a.status !== 'COMPLETED' ? "text-red-600" : "text-slate-500")}>
                        {a.status === 'COMPLETED' ? 'Done' : getDaysRemaining(a.dueDate) < 0 ? 'Overdue' : `${getDaysRemaining(a.dueDate)} days left`}
                      </p>
                    </div>
                    
                    <div className="w-32 sm:w-40 flex justify-end shrink-0">
                      <Badge variant={getStatusBadgeVariant(a.status)} className="text-xs">
                        {WORKFLOW_STAGE_LABELS[a.status]}
                      </Badge>
                    </div>

                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[var(--color-primary)] transition-colors hidden sm:block shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <p className="font-medium text-slate-700">No experiments yet</p>
              <p className="text-sm mt-1">Click the button above to add your first experiment to this subject.</p>
            </div>
          )}
        </div>
      </div>

      <ExperimentFormModal 
        isOpen={isAddExpOpen} 
        onClose={() => setIsAddExpOpen(false)} 
        preselectedSemester={subject.semester}
        preselectedSubjectId={subject.id}
      />

      <SubjectFormModal 
        isOpen={isEditSubjectOpen}
        onClose={() => setIsEditSubjectOpen(false)}
        subjectToEdit={subject}
      />

      <ConfirmationDialog
        isOpen={isDeleteSubjectOpen}
        onClose={() => setIsDeleteSubjectOpen(false)}
        onConfirm={handleDeleteSubject}
        title="Delete Subject"
        message={
          <>
            <p className="mb-2">Are you sure you want to delete <strong>{subject.name}</strong>?</p>
            {subjectAssignments.length > 0 && (
              <p className="text-red-600 font-semibold bg-red-50 p-2 rounded border border-red-100">
                This subject has {subjectAssignments.length} experiment(s) associated with it. Deleting this subject will also delete all associated experiments.
              </p>
            )}
          </>
        }
        confirmText="Delete Subject & Experiments"
        isDestructive
      />
    </div>
  );
}

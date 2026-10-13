import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useToast } from '@/store/useToast';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Calendar, User, Link as LinkIcon, CheckCircle2, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { formatDate, cn } from '@/utils';
import { ExperimentFormModal } from '@/components/assignments/ExperimentFormModal';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import type { Checklist } from '@/types';

export function AssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { assignments, subjects, updateAssignment, deleteAssignment } = useStore();
  const { addToast } = useToast();
  
  const [isEditExpOpen, setIsEditExpOpen] = useState(false);
  const [isDeleteExpOpen, setIsDeleteExpOpen] = useState(false);

  const assignment = assignments.find(a => a.id === id);
  const subject = subjects.find(s => s.id === assignment?.subjectId);

  if (!assignment || !subject) {
    return <div className="p-8 text-center">Assignment not found</div>;
  }

  const handleDeleteExperiment = () => {
    deleteAssignment(assignment.id);
    addToast("Experiment deleted successfully.");
    navigate(-1);
  };

  const TOTAL_CHECKLIST_ITEMS = 6;

  const checklist: Checklist = {
    moodleReceived: false,
    experimentWritten: false,
    experimentPerformed: false,
    templatePrepared: false,
    uploadedToMoodle: false,
    facultyChecked: false,
    ...(assignment.checklist || {})
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const progress = (completedCount / TOTAL_CHECKLIST_ITEMS) * 100;

  const toggleChecklist = (key: keyof Checklist) => {
    const newChecklist: Checklist = { ...checklist, [key]: !checklist[key] };
    const newCompletedCount = Object.values(newChecklist).filter(Boolean).length;
    
    let newStatus = assignment.status;
    if (newCompletedCount === 0) newStatus = 'NOT_STARTED';
    else if (newCompletedCount === TOTAL_CHECKLIST_ITEMS) newStatus = 'COMPLETED';
    else if (assignment.status !== 'CORRECTION_REQUIRED') newStatus = 'IN_PROGRESS';

    updateAssignment(assignment.id, { checklist: newChecklist, status: newStatus });
  };

  return (
    <div className="space-y-8 pb-10">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assignments
      </button>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="secondary" className="px-3 py-1 text-sm font-semibold uppercase tracking-wider bg-indigo-50 text-[var(--color-primary)]">
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
            <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-initial justify-center" onClick={() => setIsEditExpOpen(true)}>
              <Edit className="h-4 w-4" /> Edit
            </Button>
            <Button variant="danger" size="sm" className="gap-2 flex-1 sm:flex-initial justify-center" onClick={() => setIsDeleteExpOpen(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
            {completedCount < TOTAL_CHECKLIST_ITEMS && (
              <Button 
                onClick={() => {
                  updateAssignment(assignment.id, { 
                    status: 'COMPLETED',
                    checklist: {
                      moodleReceived: true,
                      experimentWritten: true,
                      experimentPerformed: true,
                      templatePrepared: true,
                      uploadedToMoodle: true,
                      facultyChecked: true
                    }
                  });
                }} 
                variant="outline" 
                size="sm" 
                className="gap-2 border-green-200 hover:bg-green-50 hover:text-green-700 w-full sm:w-auto justify-center"
              >
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Mark as Completed
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Assignment Checklist</h2>
              {completedCount === TOTAL_CHECKLIST_ITEMS && (
                <span className="text-xs sm:text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200 w-max">
                  Assignment workflow completed 🎉
                </span>
              )}
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-500 uppercase tracking-wider">Assignment Progress</span>
                <span className="text-slate-900">{completedCount} of {TOTAL_CHECKLIST_ITEMS} completed</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {assignment.status === 'CORRECTION_REQUIRED' && assignment.facultyFeedback && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-100 text-red-900 flex gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="font-semibold text-sm mb-1 text-red-800">Faculty Feedback</p>
                  <p className="text-sm">{assignment.facultyFeedback}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {[
                { key: 'moodleReceived' as const, title: 'Moodle Assignment Received', desc: 'Assignment received from Moodle and requirements have been read.' },
                { key: 'experimentWritten' as const, title: 'Experiment Written', desc: 'Experiment write-up has been completed.' },
                { key: 'experimentPerformed' as const, title: 'Experiment Performed', desc: 'Experiment has been completed.' },
                { key: 'templatePrepared' as const, title: 'Template Prepared', desc: 'Moodle upload template has been prepared.' },
                { key: 'uploadedToMoodle' as const, title: 'Uploaded to Moodle', desc: 'Experiment/template has been uploaded to Moodle.' },
                { key: 'facultyChecked' as const, title: 'Faculty Checked', desc: 'Experiment has been checked by the respective faculty.' }
              ].map((item) => {
                const isChecked = checklist[item.key];
                return (
                  <div 
                    key={item.key}
                    onClick={() => toggleChecklist(item.key)}
                    className={cn(
                      "group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                      isChecked 
                        ? "bg-slate-50/80 border-slate-200" 
                        : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm"
                    )}
                  >
                    <div className="mt-0.5 relative flex items-center justify-center shrink-0 w-5 h-5">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => {}} // Handled by parent div
                        className="peer h-5 w-5 appearance-none rounded border-2 border-slate-300 checked:border-[var(--color-primary)] checked:bg-[var(--color-primary)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
                        aria-label={item.title}
                      />
                      <CheckCircle2 className={cn("absolute pointer-events-none h-3.5 w-3.5 text-white transition-opacity", isChecked ? "opacity-100" : "opacity-0")} strokeWidth={4} />
                    </div>
                    <div>
                      <h3 className={cn("text-base font-bold transition-colors", isChecked ? "text-slate-500 line-through decoration-slate-300" : "text-slate-900 group-hover:text-indigo-900")}>
                        {item.title}
                      </h3>
                      <p className={cn("text-sm mt-0.5", isChecked ? "text-slate-400" : "text-slate-500")}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Overview</p>
                <p className="text-slate-700 text-sm leading-relaxed">{assignment.description}</p>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium text-xs">Due Date</p>
                    <p className="font-semibold text-slate-900">{formatDate(assignment.dueDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium text-xs">Faculty</p>
                    <p className="font-semibold text-slate-900">{assignment.faculty}</p>
                  </div>
                </div>
              </div>

              {assignment.moodleUrl && (
                <div className="pt-4 border-t border-slate-100">
                  <a 
                    href={assignment.moodleUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold transition-colors border border-slate-200"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Open in Moodle
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ExperimentFormModal 
        isOpen={isEditExpOpen} 
        onClose={() => setIsEditExpOpen(false)} 
        assignmentToEdit={assignment}
      />

      <ConfirmationDialog
        isOpen={isDeleteExpOpen}
        onClose={() => setIsDeleteExpOpen(false)}
        onConfirm={handleDeleteExperiment}
        title="Delete Experiment"
        message={
          <>
            <p>Are you sure you want to delete <strong>{assignment.title}</strong>?</p>
            <p className="mt-2">This action cannot be undone and will permanently remove this experiment from your records.</p>
          </>
        }
        confirmText="Delete Experiment"
        isDestructive
      />
    </div>
  );
}

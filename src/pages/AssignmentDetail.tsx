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
import { Stepper, StepItem } from '@/components/ui/Stepper';
import { SpringCheck } from '@/components/ui/SpringCheck';
import { Checklist, WORKFLOW_STAGE_LABELS, WorkflowStage } from '@/types';

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
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Assignment not found</h2>
        <Button className="mt-4" onClick={() => navigate('/assignments')}>
          Return to Assignments
        </Button>
      </div>
    );
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

  const toggleChecklist = (key: keyof Checklist) => {
    const newChecklist: Checklist = { ...checklist, [key]: !checklist[key] };
    const newCompletedCount = Object.values(newChecklist).filter(Boolean).length;
    
    let newStatus = assignment.status;
    if (newCompletedCount === 0) newStatus = 'NOT_STARTED';
    else if (newCompletedCount === TOTAL_CHECKLIST_ITEMS) newStatus = 'COMPLETED';
    else if (assignment.status !== 'CORRECTION_REQUIRED') newStatus = 'IN_PROGRESS';

    updateAssignment(assignment.id, { checklist: newChecklist, status: newStatus });
  };

  const checklistItems = [
    { key: 'moodleReceived' as const, title: 'Moodle Assignment Received', short: 'Received', desc: 'Assignment received from Moodle and requirements have been read.' },
    { key: 'experimentWritten' as const, title: 'Experiment Written', short: 'Written', desc: 'Experiment write-up has been completed.' },
    { key: 'experimentPerformed' as const, title: 'Experiment Performed', short: 'Performed', desc: 'Experiment has been completed in laboratory/simulator.' },
    { key: 'templatePrepared' as const, title: 'Template Prepared', short: 'Template', desc: 'Moodle upload template has been prepared.' },
    { key: 'uploadedToMoodle' as const, title: 'Uploaded to Moodle', short: 'Uploaded', desc: 'Experiment/template has been uploaded to Moodle.' },
    { key: 'facultyChecked' as const, title: 'Faculty Checked', short: 'Checked', desc: 'Experiment has been checked by the respective faculty.' }
  ];

  // Convert checklist to Stepper items
  const stepperSteps: StepItem[] = checklistItems.map((item, idx) => ({
    id: item.key,
    title: item.short,
    description: item.desc,
    isCompleted: !!checklist[item.key],
    isCurrent: !checklist[item.key] && (idx === 0 || !!checklist[checklistItems[idx - 1].key]),
  }));

  return (
    <div className="space-y-8 pb-10">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
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
                  addToast("All checklist items marked completed!");
                }} 
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

      {/* 4. React Bits Stepper Component for Experiment Steps */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <Stepper
          steps={stepperSteps}
          onStepClick={(_idx, step) => toggleChecklist(step.id as keyof Checklist)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900">
                  Assignment Checklist
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Checkboxes are independent — complete tasks in any order you choose.
                </p>
              </div>
              {completedCount === TOTAL_CHECKLIST_ITEMS && (
                <span className="text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 w-max flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Workflow Completed 🎉
                </span>
              )}
            </div>

            {assignment.status === 'CORRECTION_REQUIRED' && assignment.facultyFeedback && (
              <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100 text-red-900 flex gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="font-semibold text-sm mb-1 text-red-800">Faculty Feedback</p>
                  <p className="text-sm">{assignment.facultyFeedback}</p>
                </div>
              </div>
            )}

            {/* 6. React Bits SpringCheck Components */}
            <div className="space-y-3">
              {checklistItems.map((item) => {
                const isChecked = checklist[item.key];
                return (
                  <div 
                    key={item.key}
                    className={cn(
                      "p-4 rounded-xl border transition-all duration-200 bg-white",
                      isChecked 
                        ? "bg-slate-50/70 border-slate-200" 
                        : "border-slate-200 hover:border-indigo-300 hover:shadow-xs"
                    )}
                  >
                    <SpringCheck
                      checked={isChecked}
                      onChange={() => toggleChecklist(item.key)}
                      label={item.title}
                      description={item.desc}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Status</span>
                <Badge variant={getStatusBadgeVariant(assignment.status)} className="text-sm py-1">
                  {WORKFLOW_STAGE_LABELS[assignment.status]}
                </Badge>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Due Date</span>
                <p className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {formatDate(assignment.dueDate)}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Faculty</span>
                <p className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  {assignment.faculty || 'Not assigned'}
                </p>
              </div>

              {assignment.moodleUrl && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Moodle Resource</span>
                  <a 
                    href={assignment.moodleUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm font-semibold text-indigo-600 hover:underline flex items-center gap-1.5 break-all"
                  >
                    <LinkIcon className="h-4 w-4 shrink-0" />
                    Open Moodle Link
                  </a>
                </div>
              )}

              {assignment.description && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Description</span>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {assignment.description}
                  </p>
                </div>
              )}

              {assignment.notes && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Personal Notes</span>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {assignment.notes}
                  </p>
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
        title="Delete Experiment?"
        message={`Are you sure you want to delete "${assignment.title}"? This cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
}

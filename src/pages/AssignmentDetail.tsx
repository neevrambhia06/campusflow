import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useToast } from '@/store/useToast';
import { Button } from '@/components/ui/Button';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { Checklist } from '@/types';
import {
  ExperimentFormModal,
  AssignmentHeader,
  AssignmentWorkflowStepper,
  AssignmentChecklist,
  AssignmentSidebar,
} from '@/components/assignments';

export function AssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { assignments, subjects, updateAssignment, deleteAssignment } = useStore();
  const { addToast } = useToast();

  const [isEditExpOpen, setIsEditExpOpen] = useState(false);
  const [isDeleteExpOpen, setIsDeleteExpOpen] = useState(false);

  const assignment = assignments.find((a) => a.id === id);
  const subject = subjects.find((s) => s.id === assignment?.subjectId);

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

  const TOTAL_CHECKLIST_ITEMS = 6;

  const checklist: Checklist = {
    moodleReceived: false,
    experimentWritten: false,
    experimentPerformed: false,
    templatePrepared: false,
    uploadedToMoodle: false,
    facultyChecked: false,
    ...(assignment.checklist || {}),
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

  const handleMarkAllCompleted = () => {
    updateAssignment(assignment.id, {
      status: 'COMPLETED',
      checklist: {
        moodleReceived: true,
        experimentWritten: true,
        experimentPerformed: true,
        templatePrepared: true,
        uploadedToMoodle: true,
        facultyChecked: true,
      },
    });
    addToast('All checklist items marked completed!');
  };

  const handleDeleteExperiment = () => {
    deleteAssignment(assignment.id);
    addToast('Experiment deleted successfully.');
    navigate(-1);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Header with Breadcrumb and Action Buttons */}
      <AssignmentHeader
        assignment={assignment}
        subject={subject}
        completedCount={completedCount}
        totalCount={TOTAL_CHECKLIST_ITEMS}
        onBack={() => navigate(-1)}
        onEdit={() => setIsEditExpOpen(true)}
        onDelete={() => setIsDeleteExpOpen(true)}
        onMarkAllCompleted={handleMarkAllCompleted}
      />

      {/* 2. React Bits Stepper Component for Experiment Steps */}
      <AssignmentWorkflowStepper
        checklist={checklist}
        onToggleStep={toggleChecklist}
      />

      {/* 3. Main Content: Checklist + Sidebar Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <AssignmentChecklist
            checklist={checklist}
            completedCount={completedCount}
            totalCount={TOTAL_CHECKLIST_ITEMS}
            status={assignment.status}
            facultyFeedback={assignment.facultyFeedback}
            onToggle={toggleChecklist}
          />
        </div>

        {/* Right Info Sidebar Card */}
        <div className="space-y-6">
          <AssignmentSidebar assignment={assignment} />
        </div>
      </div>

      {/* Modals & Dialogs */}
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

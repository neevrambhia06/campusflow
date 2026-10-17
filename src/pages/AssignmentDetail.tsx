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
  AssignmentPagination,
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

  // Find all experiments for this subject, sorted by experiment number
  const subjectAssignments = assignments
    .filter((a) => a.subjectId === assignment.subjectId)
    .sort((a, b) => (a.experimentNumber || 0) - (b.experimentNumber || 0));

  const currentIndex = subjectAssignments.findIndex((a) => a.id === assignment.id);
  const prevAssignment = currentIndex > 0 ? subjectAssignments[currentIndex - 1] : null;

  // Next experiment in the same course, or fallback to next chronological experiment
  let nextAssignment =
    currentIndex >= 0 && currentIndex < subjectAssignments.length - 1
      ? subjectAssignments[currentIndex + 1]
      : null;

  if (!nextAssignment) {
    const allSorted = [...assignments].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    const overallIndex = allSorted.findIndex((a) => a.id === assignment.id);
    if (overallIndex >= 0 && overallIndex < allSorted.length - 1) {
      nextAssignment = allSorted[overallIndex + 1];
    }
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
    <div className="space-y-8 pb-12">
      {/* 1. Header with Breadcrumb, Actions, and Quick Next/Prev Switchers */}
      <AssignmentHeader
        assignment={assignment}
        subject={subject}
        completedCount={completedCount}
        totalCount={TOTAL_CHECKLIST_ITEMS}
        prevAssignment={prevAssignment}
        nextAssignment={nextAssignment}
        onBack={() => navigate(-1)}
        onEdit={() => setIsEditExpOpen(true)}
        onDelete={() => setIsDeleteExpOpen(true)}
        onMarkAllCompleted={handleMarkAllCompleted}
        onNavigateToAssignment={(targetId) => navigate(`/assignments/${targetId}`)}
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

      {/* 4. Bottom Pagination Bar to Navigate to Next / Previous Experiment */}
      <AssignmentPagination
        prevAssignment={prevAssignment}
        nextAssignment={nextAssignment}
      />

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

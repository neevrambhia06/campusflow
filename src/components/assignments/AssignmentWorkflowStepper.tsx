import { Stepper, StepItem } from '@/components/ui/Stepper';
import { Checklist } from '@/types';

interface AssignmentWorkflowStepperProps {
  checklist: Checklist;
  onToggleStep: (key: keyof Checklist) => void;
}

export function AssignmentWorkflowStepper({
  checklist,
  onToggleStep,
}: AssignmentWorkflowStepperProps) {
  const checklistItems = [
    { key: 'moodleReceived' as const, short: 'Received', desc: 'Assignment received from Moodle' },
    { key: 'experimentWritten' as const, short: 'Written', desc: 'Experiment write-up completed' },
    { key: 'experimentPerformed' as const, short: 'Performed', desc: 'Completed in lab/simulator' },
    { key: 'templatePrepared' as const, short: 'Template', desc: 'Moodle template prepared' },
    { key: 'uploadedToMoodle' as const, short: 'Uploaded', desc: 'Uploaded to Moodle' },
    { key: 'facultyChecked' as const, short: 'Checked', desc: 'Approved by faculty' },
  ];

  const stepperSteps: StepItem[] = checklistItems.map((item, idx) => ({
    id: item.key,
    title: item.short,
    description: item.desc,
    isCompleted: !!checklist[item.key],
    isCurrent: !checklist[item.key] && (idx === 0 || !!checklist[checklistItems[idx - 1].key]),
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <Stepper
        steps={stepperSteps}
        onStepClick={(_idx, step) => onToggleStep(step.id as keyof Checklist)}
      />
    </div>
  );
}

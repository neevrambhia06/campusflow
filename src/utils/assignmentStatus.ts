import { Assignment, Checklist } from '@/types';

export interface AssignmentStatusInfo {
  label: string;
  variant: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'secondary' | 'indigo' | 'purple';
  pendingKey?: keyof Checklist;
  completedCount: number;
  totalCount: number;
  remainingCount: number;
  allPendingLabels: string[];
  isCompleted: boolean;
  isCorrection: boolean;
}

export const CHECKLIST_STEPS: Array<{
  key: keyof Checklist;
  action: string;
  past: string;
  variant: 'default' | 'indigo' | 'warning' | 'purple';
}> = [
  {
    key: 'moodleReceived',
    action: 'Receive Assignment',
    past: 'Moodle Received',
    variant: 'indigo',
  },
  {
    key: 'experimentWritten',
    action: 'Write Experiment',
    past: 'Experiment Written',
    variant: 'indigo',
  },
  {
    key: 'experimentPerformed',
    action: 'Perform Experiment',
    past: 'Experiment Performed',
    variant: 'indigo',
  },
  {
    key: 'templatePrepared',
    action: 'Prepare Template',
    past: 'Template Prepared',
    variant: 'warning',
  },
  {
    key: 'uploadedToMoodle',
    action: 'Upload to Moodle',
    past: 'Uploaded to Moodle',
    variant: 'indigo',
  },
  {
    key: 'facultyChecked',
    action: 'Faculty Check',
    past: 'Faculty Checked',
    variant: 'purple',
  },
];

/**
 * Derives the active status of an assignment by looking at what is left in its checklist.
 * If all 6 items are checked (or status is explicitly COMPLETED), returns 'Completed'.
 * If CORRECTION_REQUIRED, highlights the correction need.
 * Otherwise returns the next pending checklist action (e.g. 'Perform Experiment').
 */
export function getAssignmentChecklistStatus(
  assignment: Pick<Assignment, 'status' | 'checklist'>
): AssignmentStatusInfo {
  const checklist: Checklist = {
    moodleReceived: false,
    experimentWritten: false,
    experimentPerformed: false,
    templatePrepared: false,
    uploadedToMoodle: false,
    facultyChecked: false,
    ...(assignment.checklist || {}),
  };

  const completedCount = CHECKLIST_STEPS.filter((step) => !!checklist[step.key]).length;
  const totalCount = CHECKLIST_STEPS.length;
  const remainingCount = totalCount - completedCount;

  const pendingSteps = CHECKLIST_STEPS.filter((step) => !checklist[step.key]);
  const allPendingLabels = pendingSteps.map((step) => step.action);

  // 1. All checklist items are checked OR status is explicitly COMPLETED
  if (completedCount === totalCount || assignment.status === 'COMPLETED') {
    return {
      label: 'Completed',
      variant: 'success',
      completedCount: totalCount,
      totalCount,
      remainingCount: 0,
      allPendingLabels: [],
      isCompleted: true,
      isCorrection: false,
    };
  }

  // 2. Explicit faculty correction required
  if (assignment.status === 'CORRECTION_REQUIRED') {
    const firstPending = pendingSteps[0];
    return {
      label: firstPending && firstPending.key !== 'facultyChecked' 
        ? `Correction: ${firstPending.action}` 
        : 'Correction Required',
      variant: 'error',
      pendingKey: firstPending?.key,
      completedCount,
      totalCount,
      remainingCount,
      allPendingLabels,
      isCompleted: false,
      isCorrection: true,
    };
  }

  // 3. Return the specific next task that is left from the assignment checklist
  const firstPending = pendingSteps[0];

  if (!firstPending) {
    return {
      label: 'Completed',
      variant: 'success',
      completedCount: totalCount,
      totalCount,
      remainingCount: 0,
      allPendingLabels: [],
      isCompleted: true,
      isCorrection: false,
    };
  }

  return {
    label: firstPending.action,
    variant: firstPending.variant,
    pendingKey: firstPending.key,
    completedCount,
    totalCount,
    remainingCount,
    allPendingLabels,
    isCompleted: false,
    isCorrection: false,
  };
}

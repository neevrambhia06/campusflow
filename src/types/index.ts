export type Priority = 'low' | 'medium' | 'high';

export type WorkflowStage =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'READY_FOR_UPLOAD'
  | 'UPLOADED'
  | 'FACULTY_CHECKING'
  | 'CORRECTION_REQUIRED'
  | 'COMPLETED';

export interface Subject {
  id: string;
  name: string;
  code: string;
  semester: string;
  faculty?: string;
  description?: string;
  color: string;
}

export interface Checklist {
  moodleReceived: boolean;
  experimentPerformed: boolean;
  templatePrepared: boolean;
  uploadedToMoodle: boolean;
  facultyChecked: boolean;
}

export interface Assignment {
  id: string;
  subjectId: string;
  experimentNumber: number;
  title: string;
  description: string;
  moodleUrl?: string;
  faculty: string;
  releaseDate: string; // ISO format YYYY-MM-DD
  dueDate: string; // ISO format YYYY-MM-DD
  priority: Priority;
  status: WorkflowStage;
  checklist?: Checklist;
  facultyFeedback?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const WORKFLOW_STAGES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'READY_FOR_UPLOAD',
  'UPLOADED',
  'FACULTY_CHECKING',
  'CORRECTION_REQUIRED',
  'COMPLETED'
] as const;

export const WORKFLOW_STAGE_LABELS: Record<WorkflowStage, string> = {
  NOT_STARTED: 'Moodle Assignment Received',
  IN_PROGRESS: 'Perform Experiment',
  READY_FOR_UPLOAD: 'Template Prepared',
  UPLOADED: 'Uploaded to Moodle',
  FACULTY_CHECKING: 'Faculty Checking',
  CORRECTION_REQUIRED: 'Correction Required',
  COMPLETED: 'Completed'
};

/**
 * Moodle Integration Service for CampusFlow
 * 
 * Supports:
 * 1. Official Moodle Web Services API (via Vite proxy / server relay)
 * 2. Automated Course & Assignment discovery
 * 3. Submission status detection (Submitted vs Pending)
 * 4. Experiment extraction & topic mapping
 * 5. Safe local credential storage
 */

import { Assignment, Subject, WorkflowStage, Priority } from '@/types';

export interface MoodleCredentials {
  url: string;
  username: string;
  password?: string;
  token?: string;
  remember?: boolean;
}

export interface MoodleCourse {
  id: number;
  fullname: string;
  shortname: string;
  idnumber?: string;
}

export interface MoodleRawAssignment {
  id: number;
  cmid: number;
  course: number;
  name: string;
  intro?: string;
  duedate: number;
  cutoffdate?: number;
  allowsubmissionsfromdate?: number;
}

export interface MoodleCourseAssignmentsResponse {
  courses: Array<{
    id: number;
    fullname: string;
    shortname: string;
    assignments: MoodleRawAssignment[];
  }>;
  warnings?: unknown[];
}

export interface MoodleSubmissionStatus {
  submitted: boolean;
  graded: boolean;
  timeModified?: number;
  feedback?: string;
}

export interface MoodleExtractedExperiment {
  moodleAssignId: number;
  moodleCmid: number;
  courseId: number;
  courseName: string;
  courseCode: string;
  experimentNumber: number;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  moodleUrl: string;
  isSubmitted: boolean;
  isGraded: boolean;
  feedback?: string;
  topic?: string;
  selected: boolean;
}

export interface MoodleScanResult {
  siteName?: string;
  userName?: string;
  coursesCount: number;
  experiments: MoodleExtractedExperiment[];
}

const CREDENTIALS_KEY = 'campusflow_moodle_creds';

/**
 * Save Moodle connection preferences to localStorage
 */
export function saveStoredCredentials(creds: MoodleCredentials) {
  try {
    const toSave = {
      url: creds.url.trim().replace(/\/+$/, ''),
      username: creds.username.trim(),
      password: creds.remember ? creds.password : undefined,
      token: creds.token,
      remember: creds.remember ?? false,
    };
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.warn('[MoodleService] Failed to save credentials', err);
  }
}

/**
 * Retrieve saved Moodle connection preferences
 */
export function getStoredCredentials(): MoodleCredentials {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[MoodleService] Failed to load credentials', err);
  }
  return {
    url: '',
    username: '',
    password: '',
    remember: false,
  };
}

/**
 * Send request through the Vite / server proxy to avoid browser CORS
 */
async function proxyFetch(
  targetUrl: string,
  method: 'GET' | 'POST' = 'GET',
  headers: Record<string, string> = {},
  data?: unknown
): Promise<any> {
  const response = await fetch('/api/moodle-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: targetUrl,
      method,
      headers,
      data,
    }),
  });

  if (!response.ok) {
    let errorMsg = `Server returned status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

/**
 * Parse an experiment number from an assignment title or topic string
 */
export function extractExperimentNumber(title: string, indexFallback: number): number {
  // Matches: "Exp 1", "Experiment 02", "Lab 3", "Practical #4", "Assignment 5", "E1", "Ex-2"
  const patterns = [
    /(?:exp(?:eriment)?|lab|practical|assignment|unit|task)\s*[:#\-_]?\s*0*(\d+)/i,
    /\b(?:e|ex)\s*0*(\d+)\b/i,
    /^\s*0*(\d+)\s*[:.\-_]/,
    /#\s*0*(\d+)/,
  ];

  for (const regex of patterns) {
    const match = title.match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0 && num < 100) {
        return num;
      }
    }
  }

  return indexFallback;
}

/**
 * Clean course code or name
 */
export function extractCourseCode(course: { fullname: string; shortname: string }): string {
  if (course.shortname && course.shortname.length <= 10 && !course.shortname.includes(' ')) {
    return course.shortname.toUpperCase();
  }
  const match = course.fullname.match(/\b([A-Z]{2,4}\s*[-_]?\s*\d{2,4})\b/i);
  if (match) {
    return match[1].replace(/[-_\s]/g, '').toUpperCase();
  }
  return course.shortname || course.fullname.substring(0, 8);
}

/**
 * Connect to Moodle, authenticate, and scan all assignments & submission statuses
 */
export async function scanMoodle(
  creds: MoodleCredentials,
  onProgress?: (step: string, percent: number) => void
): Promise<MoodleScanResult> {
  const baseUrl = creds.url.trim().replace(/\/+$/, '');
  if (!baseUrl) {
    throw new Error('Please enter your college Moodle URL.');
  }

  let token = creds.token;

  // 1. Authenticate to get Web Service token if not already possessed
  if (!token) {
    if (!creds.username || !creds.password) {
      throw new Error('Please enter both your Moodle username and password.');
    }

    onProgress?.('Authenticating with Moodle...', 15);
    const tokenUrl = `${baseUrl}/login/token.php`;
    
    const tokenResponse = await proxyFetch(
      tokenUrl,
      'POST',
      { 'Content-Type': 'application/x-www-form-urlencoded' },
      {
        username: creds.username,
        password: creds.password,
        service: 'moodle_mobile_app',
      }
    );

    if (tokenResponse.error) {
      throw new Error(`Moodle login error: ${tokenResponse.error}`);
    }

    if (!tokenResponse.token) {
      throw new Error('Could not obtain Moodle Web Service token. Ensure the Moodle Mobile service is enabled for your account, or use the 1-Click Bookmarklet.');
    }

    token = tokenResponse.token;
  }

  // 2. Query Site Info & User ID
  onProgress?.('Verifying student session...', 30);
  const serverUrl = `${baseUrl}/webservice/rest/server.php`;

  const siteInfo = await proxyFetch(
    serverUrl,
    'POST',
    { 'Content-Type': 'application/x-www-form-urlencoded' },
    {
      wstoken: token,
      wsfunction: 'core_webservice_get_site_info',
      moodlewsrestformat: 'json',
    }
  );

  if (siteInfo.exception) {
    throw new Error(`Moodle Error: ${siteInfo.message || siteInfo.errorcode}`);
  }

  const userId = siteInfo.userid;
  const userName = siteInfo.fullname || creds.username;
  const siteName = siteInfo.sitename;

  // 3. Query Enrolled Courses
  onProgress?.('Scanning enrolled subjects and labs...', 45);
  const courses: MoodleCourse[] = await proxyFetch(
    serverUrl,
    'POST',
    { 'Content-Type': 'application/x-www-form-urlencoded' },
    {
      wstoken: token,
      wsfunction: 'core_enrol_get_users_courses',
      moodlewsrestformat: 'json',
      userid: userId,
    }
  );

  if (!Array.isArray(courses) || courses.length === 0) {
    return {
      siteName,
      userName,
      coursesCount: 0,
      experiments: [],
    };
  }

  // 4. Query Assignments across all courses
  onProgress?.('Extracting experiments and deadlines...', 65);
  const courseIds = courses.map((c) => c.id);
  const assignmentsData: MoodleCourseAssignmentsResponse = await proxyFetch(
    serverUrl,
    'POST',
    { 'Content-Type': 'application/x-www-form-urlencoded' },
    {
      wstoken: token,
      wsfunction: 'mod_assign_get_assignments',
      moodlewsrestformat: 'json',
      courseids: courseIds,
    }
  );

  const rawAssignmentsByCourse = assignmentsData.courses || [];
  const extractedList: MoodleExtractedExperiment[] = [];

  // 5. Query submission statuses for all found assignments
  onProgress?.('Checking submission statuses (submitted vs pending)...', 80);

  for (const c of rawAssignmentsByCourse) {
    const courseMeta = courses.find((cm) => cm.id === c.id);
    const courseCode = courseMeta ? extractCourseCode(courseMeta) : `SUBJ${c.id}`;
    let expCounter = 1;

    for (const a of c.assignments) {
      let isSubmitted = false;
      let isGraded = false;
      let feedback = '';

      try {
        const subData = await proxyFetch(
          serverUrl,
          'POST',
          { 'Content-Type': 'application/x-www-form-urlencoded' },
          {
            wstoken: token,
            wsfunction: 'mod_assign_get_submission_status',
            moodlewsrestformat: 'json',
            assignid: a.id,
          }
        );

        if (subData?.lastattempt?.submission?.status === 'submitted') {
          isSubmitted = true;
        }
        if (subData?.feedback?.grade?.grade) {
          isGraded = true;
          feedback = `Graded: ${subData.feedback.grade.grade}`;
        }
      } catch {
        // Continue with basic status if detailed status query fails for one item
      }

      const expNum = extractExperimentNumber(a.name, expCounter++);
      const dueDate = a.duedate && a.duedate > 0
        ? new Date(a.duedate * 1000).toISOString().split('T')[0]
        : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      // Strip HTML tags from description/intro
      const cleanDescription = (a.intro || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const moodleDirectUrl = `${baseUrl}/mod/assign/view.php?id=${a.cmid || a.id}`;

      extractedList.push({
        moodleAssignId: a.id,
        moodleCmid: a.cmid || a.id,
        courseId: c.id,
        courseName: c.fullname,
        courseCode,
        experimentNumber: expNum,
        title: a.name.trim(),
        description: cleanDescription,
        dueDate,
        moodleUrl: moodleDirectUrl,
        isSubmitted,
        isGraded,
        feedback,
        selected: true,
      });
    }
  }

  onProgress?.('Scan complete! Ready to import.', 100);

  return {
    siteName,
    userName,
    coursesCount: courses.length,
    experiments: extractedList,
  };
}

/**
 * Sync the selected experiments into CampusFlow store
 */
export async function applyMoodleSyncToStore(
  selectedExperiments: MoodleExtractedExperiment[],
  currentSubjects: Subject[],
  currentAssignments: Assignment[],
  actions: {
    addSubject: (s: Subject) => Promise<void>;
    addAssignment: (a: Assignment) => Promise<void>;
    updateAssignment: (id: string, updates: Partial<Assignment>) => Promise<void>;
  }
): Promise<{ added: number; updated: number; subjectsCreated: number }> {
  let added = 0;
  let updated = 0;
  let subjectsCreated = 0;

  const subjectMap = new Map<string, string>(); // courseName/code -> CampusFlow subject.id
  currentSubjects.forEach((s) => {
    subjectMap.set(s.name.toLowerCase(), s.id);
    if (s.code) subjectMap.set(s.code.toLowerCase(), s.id);
  });

  const subjectColors = [
    'bg-indigo-600',
    'bg-blue-600',
    'bg-emerald-600',
    'bg-amber-600',
    'bg-purple-600',
    'bg-rose-600',
    'bg-cyan-600',
  ];

  for (const exp of selectedExperiments) {
    if (!exp.selected) continue;

    // 1. Resolve or Create Subject
    let subjectId = subjectMap.get(exp.courseName.toLowerCase()) || subjectMap.get(exp.courseCode.toLowerCase());

    if (!subjectId) {
      subjectId = `subj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const randomColor = subjectColors[subjectMap.size % subjectColors.length];
      const newSubject: Subject = {
        id: subjectId,
        name: exp.courseName,
        code: exp.courseCode,
        semester: 'Semester 6', // Default or user can adjust
        color: randomColor,
        description: `Imported from Moodle (${exp.courseName})`,
      };
      await actions.addSubject(newSubject);
      subjectMap.set(exp.courseName.toLowerCase(), subjectId);
      subjectMap.set(exp.courseCode.toLowerCase(), subjectId);
      subjectsCreated++;
    }

    // 2. Check if assignment already exists in CampusFlow
    const existing = currentAssignments.find(
      (a) =>
        (a.moodleUrl && a.moodleUrl === exp.moodleUrl) ||
        (a.subjectId === subjectId && a.experimentNumber === exp.experimentNumber) ||
        (a.subjectId === subjectId && a.title.toLowerCase() === exp.title.toLowerCase())
    );

    const now = new Date().toISOString();

    // Determine workflow stage and checklist from Moodle submission state
    let targetStatus: WorkflowStage = 'NOT_STARTED';
    if (exp.isGraded) {
      targetStatus = 'COMPLETED';
    } else if (exp.isSubmitted) {
      targetStatus = 'UPLOADED';
    }

    if (existing) {
      // Update existing assignment with fresh Moodle info while respecting user's existing checklist
      const mergedChecklist = {
        moodleReceived: true,
        experimentWritten: existing.checklist?.experimentWritten ?? false,
        experimentPerformed: existing.checklist?.experimentPerformed ?? false,
        templatePrepared: existing.checklist?.templatePrepared ?? false,
        uploadedToMoodle: exp.isSubmitted || (existing.checklist?.uploadedToMoodle ?? false),
        facultyChecked: exp.isGraded || (existing.checklist?.facultyChecked ?? false),
      };

      const finalStatus: WorkflowStage = 
        exp.isGraded ? 'COMPLETED' : 
        exp.isSubmitted ? 'UPLOADED' : 
        existing.status;

      await actions.updateAssignment(existing.id, {
        dueDate: exp.dueDate,
        moodleUrl: exp.moodleUrl,
        checklist: mergedChecklist,
        status: finalStatus,
        facultyFeedback: exp.feedback || existing.facultyFeedback,
      });
      updated++;
    } else {
      // Create new assignment
      const newAssignment: Assignment = {
        id: `asgn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subjectId,
        experimentNumber: exp.experimentNumber,
        title: exp.title,
        description: exp.description,
        moodleUrl: exp.moodleUrl,
        faculty: 'Faculty',
        releaseDate: new Date().toISOString().split('T')[0],
        dueDate: exp.dueDate,
        priority: 'medium' as Priority,
        status: targetStatus,
        checklist: {
          moodleReceived: true,
          experimentWritten: false,
          experimentPerformed: false,
          templatePrepared: false,
          uploadedToMoodle: exp.isSubmitted,
          facultyChecked: exp.isGraded,
        },
        facultyFeedback: exp.feedback,
        createdAt: now,
        updatedAt: now,
      };

      await actions.addAssignment(newAssignment);
      added++;
    }
  }

  return { added, updated, subjectsCreated };
}

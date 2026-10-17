/**
 * Moodle Integration Service for CampusFlow
 * 
 * Supports:
 * 1. Official Moodle Web Services API (Direct CORS & Proxy fallback)
 * 2. Automated Course & Assignment discovery
 * 3. Submission status detection (Submitted vs Pending)
 * 4. Course section & experiment topic extraction
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

export interface MoodleExtractedExperiment {
  moodleAssignId: number;
  moodleCmid: number;
  courseId: number;
  courseName: string;
  courseCode: string;
  experimentNumber: number;
  title: string;
  topic?: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  moodleUrl: string;
  isSubmitted: boolean;
  isGraded: boolean;
  feedback?: string;
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
 * Serialize parameters for Moodle Web Services API
 * Supports simple keys, string values, and arrays like courseids[0]=1&courseids[1]=2
 */
function serializeMoodleData(data: unknown): string {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      if (val === undefined || val === null) continue;
      if (Array.isArray(val)) {
        val.forEach((item, idx) => {
          params.append(`${key}[${idx}]`, String(item));
        });
      } else {
        params.append(key, String(val));
      }
    }
    return params.toString();
  }
  return String(data);
}

/**
 * Send request directly to Moodle, falling back to Vite proxy if browser CORS restricts it
 */
async function fetchMoodleApi(
  targetUrl: string,
  method: 'GET' | 'POST' = 'GET',
  headers: Record<string, string> = {},
  data?: unknown
): Promise<any> {
  const bodyString = serializeMoodleData(data);
  const defaultHeaders: Record<string, string> = {
    ...headers,
  };
  if (bodyString && !defaultHeaders['Content-Type']) {
    defaultHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  // 1. Direct browser fetch (APSIT and modern Moodle instances have Access-Control-Allow-Origin: *)
  try {
    const response = await fetch(targetUrl, {
      method,
      headers: defaultHeaders,
      body: method === 'POST' ? bodyString : undefined,
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    }
  } catch (directErr) {
    console.warn('[MoodleService] Direct browser fetch failed (trying proxy fallback):', directErr);
  }

  // 2. Fallback to /api/moodle-proxy for local dev server
  try {
    const proxyRes = await fetch('/api/moodle-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: targetUrl,
        method,
        headers: defaultHeaders,
        data: bodyString,
      }),
    });

    if (proxyRes.ok) {
      const contentType = proxyRes.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await proxyRes.json();
      }
      return await proxyRes.text();
    }
  } catch (proxyErr) {
    console.warn('[MoodleService] Proxy fetch also failed:', proxyErr);
  }

  // 3. Fallback error with clear actionable guidance
  throw new Error(
    `Could not reach Moodle server. Please check the URL or use the 1-Click Bookmarklet tab to sync directly from your Moodle tab!`
  );
}

/**
 * Parse an experiment number from an assignment title or topic string
 */
export function extractExperimentNumber(title: string, indexFallback: number): number {
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
 * Clean HTML markup from descriptions
 */
function cleanHtml(html: string): string {
  return (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

  // 1. Authenticate to get Web Service token
  if (!token) {
    if (!creds.username || !creds.password) {
      throw new Error('Please enter both your Moodle username and password.');
    }

    onProgress?.('Authenticating with Moodle...', 15);
    const tokenUrl = `${baseUrl}/login/token.php`;
    
    const tokenResponse = await fetchMoodleApi(
      tokenUrl,
      'POST',
      { 'Content-Type': 'application/x-www-form-urlencoded' },
      {
        username: creds.username.trim(),
        password: creds.password.trim(),
        service: 'moodle_mobile_app',
      }
    );

    if (tokenResponse?.error || tokenResponse?.errorcode) {
      if (tokenResponse.errorcode === 'invalidlogin') {
        throw new Error('Invalid username or password. Please verify your credentials.');
      }
      if (tokenResponse.errorcode === 'enablemobilewebservice') {
        throw new Error(
          'Mobile Web Services are disabled by your college admin on this site. Please switch to the "1-Click Bookmarklet" tab above to sync instantly!'
        );
      }
      throw new Error(`Moodle login error: ${tokenResponse.error || tokenResponse.message || tokenResponse.errorcode}`);
    }

    if (!tokenResponse?.token) {
      throw new Error('Could not obtain Moodle Web Service token. Please check your credentials or use the 1-Click Bookmarklet.');
    }

    token = tokenResponse.token;
  }

  // 2. Query Site Info & Student Identity
  onProgress?.('Verifying student session...', 30);
  const serverUrl = `${baseUrl}/webservice/rest/server.php`;

  const siteInfo = await fetchMoodleApi(
    serverUrl,
    'POST',
    { 'Content-Type': 'application/x-www-form-urlencoded' },
    {
      wstoken: token,
      wsfunction: 'core_webservice_get_site_info',
      moodlewsrestformat: 'json',
    }
  );

  if (siteInfo?.exception || siteInfo?.errorcode) {
    if (siteInfo.errorcode === 'invalidtoken') {
      throw new Error('Session token expired or invalid. Please re-enter your credentials.');
    }
    throw new Error(`Moodle Error: ${siteInfo.message || siteInfo.errorcode}`);
  }

  const userId = siteInfo.userid;
  const userName = siteInfo.fullname || creds.username;
  const siteName = siteInfo.sitename;

  // 3. Query Enrolled Courses & Lab Subjects
  onProgress?.('Scanning enrolled subjects and labs...', 45);
  const courses: MoodleCourse[] = await fetchMoodleApi(
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

  // 4. Query Course Contents to extract Topics for each section
  onProgress?.('Reading experiment topics and lab modules...', 60);
  const topicMapByCmid = new Map<number, string>(); // cmid -> topic title
  const topicMapByAssignId = new Map<number, string>(); // assignId -> topic title

  for (const c of courses) {
    try {
      const contents = await fetchMoodleApi(
        serverUrl,
        'POST',
        { 'Content-Type': 'application/x-www-form-urlencoded' },
        {
          wstoken: token,
          wsfunction: 'core_course_get_contents',
          moodlewsrestformat: 'json',
          courseid: c.id,
        }
      );

      if (Array.isArray(contents)) {
        for (const section of contents) {
          const sectionName = section.name || '';
          if (Array.isArray(section.modules)) {
            for (const mod of section.modules) {
              if (mod.modname === 'assign' || mod.modname === 'assignment') {
                if (mod.id) topicMapByCmid.set(mod.id, sectionName);
                if (mod.instance) topicMapByAssignId.set(mod.instance, sectionName);
              }
            }
          }
        }
      }
    } catch {
      // Continue if contents query fails for a single course
    }
  }

  // 5. Query Assignments across all courses
  onProgress?.('Extracting assignments and deadlines...', 75);
  const courseIds = courses.map((c) => c.id);
  const assignmentsData: MoodleCourseAssignmentsResponse = await fetchMoodleApi(
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

  const rawAssignmentsByCourse = assignmentsData?.courses || [];
  const extractedList: MoodleExtractedExperiment[] = [];

  // 6. Check submission status for all discovered experiments
  onProgress?.('Checking submission statuses (submitted vs pending)...', 85);

  for (const c of rawAssignmentsByCourse) {
    const courseMeta = courses.find((cm) => cm.id === c.id);
    const courseCode = courseMeta ? extractCourseCode(courseMeta) : `SUBJ${c.id}`;
    let expCounter = 1;

    for (const a of c.assignments) {
      let isSubmitted = false;
      let isGraded = false;
      let feedback = '';

      try {
        const subData = await fetchMoodleApi(
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

        const subStatus = subData?.lastattempt?.submission?.status || '';
        if (subStatus === 'submitted') {
          isSubmitted = true;
        }
        if (subData?.feedback?.grade?.grade) {
          isGraded = true;
          feedback = `Graded: ${subData.feedback.grade.grade}`;
        }
      } catch {
        // Continue if single submission status query fails
      }

      const expNum = extractExperimentNumber(a.name, expCounter++);
      const dueDate = a.duedate && a.duedate > 0
        ? new Date(a.duedate * 1000).toISOString().split('T')[0]
        : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      const cleanDescription = cleanHtml(a.intro || '');
      const moodleDirectUrl = `${baseUrl}/mod/assign/view.php?id=${a.cmid || a.id}`;

      // Find topic from section contents if available
      const sectionTopic = topicMapByCmid.get(a.cmid) || topicMapByAssignId.get(a.id);
      let topic = sectionTopic;
      if (!topic || topic.toLowerCase().startsWith('general') || topic.toLowerCase().startsWith('topic')) {
        topic = cleanDescription.substring(0, 80) || a.name;
      }

      extractedList.push({
        moodleAssignId: a.id,
        moodleCmid: a.cmid || a.id,
        courseId: c.id,
        courseName: c.fullname,
        courseCode,
        experimentNumber: expNum,
        title: a.name.trim(),
        topic: topic?.trim(),
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
        semester: 'Semester 6',
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

    // Determine workflow stage from Moodle submission status
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
        notes: exp.topic ? `Topic: ${exp.topic}` : existing.notes,
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
        description: exp.description || (exp.topic ? `Topic: ${exp.topic}` : ''),
        notes: exp.topic ? `Topic: ${exp.topic}` : undefined,
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

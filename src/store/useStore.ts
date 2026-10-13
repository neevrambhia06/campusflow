/**
 * useStore — Offline-First, Supabase-Synced Data Store for CampusFlow.
 *
 * Key features:
 * 1. Instant Startup: Loads from local cache immediately — NO BLANK SCREENS.
 * 2. Supabase Cloud Sync: Automatically syncs with Supabase in the background.
 * 3. Realtime Cross-Device Sync: Updates from mobile reflect live on desktop and vice-versa.
 * 4. Graceful Fallback: If tables haven't been created yet or device is offline,
 *    CampusFlow functions completely in local mode without interruption.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Subject, Assignment, Checklist } from '@/types';

export const ALL_SEMESTERS = [
  'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
  'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8',
];

// ---------------------------------------------------------------------------
// Supabase Row Types
// ---------------------------------------------------------------------------

interface SubjectRow {
  id: string;
  name: string;
  code: string;
  semester: string;
  faculty: string | null;
  description: string | null;
  color: string;
  created_at: string;
}

interface AssignmentRow {
  id: string;
  subject_id: string;
  experiment_number: number;
  title: string;
  description: string | null;
  moodle_url: string | null;
  faculty: string;
  release_date: string;
  due_date: string;
  priority: string;
  status: string;
  checklist: Checklist | null;
  faculty_feedback: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function rowToSubject(row: SubjectRow): Subject {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    semester: row.semester,
    faculty: row.faculty ?? undefined,
    description: row.description ?? undefined,
    color: row.color,
  };
}

function subjectToRow(s: Subject): Omit<SubjectRow, 'created_at'> {
  return {
    id: s.id,
    name: s.name,
    code: s.code || '',
    semester: s.semester,
    faculty: s.faculty ?? null,
    description: s.description ?? null,
    color: s.color,
  };
}

function rowToAssignment(row: AssignmentRow): Assignment {
  return {
    id: row.id,
    subjectId: row.subject_id,
    experimentNumber: row.experiment_number,
    title: row.title,
    description: row.description ?? '',
    moodleUrl: row.moodle_url ?? undefined,
    faculty: row.faculty,
    releaseDate: row.release_date,
    dueDate: row.due_date,
    priority: (row.priority as Assignment['priority']) || 'medium',
    status: (row.status as Assignment['status']) || 'NOT_STARTED',
    checklist: row.checklist ?? undefined,
    facultyFeedback: row.faculty_feedback ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function assignmentToRow(a: Assignment): Omit<AssignmentRow, 'created_at' | 'updated_at'> & { created_at: string; updated_at: string } {
  return {
    id: a.id,
    subject_id: a.subjectId,
    experiment_number: a.experimentNumber,
    title: a.title,
    description: a.description ?? null,
    moodle_url: a.moodleUrl ?? null,
    faculty: a.faculty || '',
    release_date: a.releaseDate || '',
    due_date: a.dueDate || '',
    priority: a.priority,
    status: a.status,
    checklist: a.checklist ?? null,
    faculty_feedback: a.facultyFeedback ?? null,
    notes: a.notes ?? null,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Local Cache Helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'campusflow-storage';

function loadLocalCache(): { subjects: Subject[]; assignments: Assignment[] } {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return { subjects: [], assignments: [] };
    const parsed = JSON.parse(raw);
    const state = parsed.state || parsed;
    return {
      subjects: Array.isArray(state.subjects) ? state.subjects : [],
      assignments: Array.isArray(state.assignments) ? state.assignments : [],
    };
  } catch {
    return { subjects: [], assignments: [] };
  }
}

function saveLocalCache(subjects: Subject[], assignments: Assignment[]) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ state: { subjects, assignments } })
      );
    }
  } catch (err) {
    console.warn('[CampusFlow] Failed to write local cache', err);
  }
}

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

export type DbSyncStatus = 'syncing' | 'connected' | 'needs_schema' | 'offline';

interface StoreState {
  subjects: Subject[];
  assignments: Assignment[];
  isLoading: boolean;
  syncStatus: DbSyncStatus;
  error: string | null;
  addSubject: (subject: Subject) => Promise<void>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addAssignment: (assignment: Assignment) => Promise<void>;
  updateAssignment: (id: string, updates: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Singleton State
// ---------------------------------------------------------------------------

const initialCache = loadLocalCache();
let _subjects: Subject[] = initialCache.subjects;
let _assignments: Assignment[] = initialCache.assignments;
let _isLoading = false; // Never block UI on load
let _syncStatus: DbSyncStatus = 'syncing';
let _error: string | null = null;
let _listeners: Array<() => void> = [];
let _initialized = false;

function notify() {
  saveLocalCache(_subjects, _assignments);
  _listeners.forEach((fn) => fn());
}

async function syncWithSupabase() {
  try {
    const [subjectsResult, assignmentsResult] = await Promise.all([
      supabase.from('subjects').select('*').order('created_at', { ascending: true }),
      supabase.from('assignments').select('*').order('created_at', { ascending: true }),
    ]);

    // Handle missing tables in Supabase
    if (subjectsResult.error) {
      if (subjectsResult.error.code === 'PGRST205') {
        _syncStatus = 'needs_schema';
        _error = 'Database tables have not been created yet. Run supabase/schema.sql in your Supabase SQL editor.';
        notify();
        return;
      }
      throw subjectsResult.error;
    }
    if (assignmentsResult.error) {
      if (assignmentsResult.error.code === 'PGRST205') {
        _syncStatus = 'needs_schema';
        _error = 'Database tables have not been created yet. Run supabase/schema.sql in your Supabase SQL editor.';
        notify();
        return;
      }
      throw assignmentsResult.error;
    }

    const remoteSubjects = (subjectsResult.data as SubjectRow[] || []).map(rowToSubject);
    const remoteAssignments = (assignmentsResult.data as AssignmentRow[] || []).map(rowToAssignment);

    // If Supabase has data, remote is source of truth
    if (remoteSubjects.length > 0 || remoteAssignments.length > 0) {
      _subjects = remoteSubjects;
      _assignments = remoteAssignments;
    } else if (_subjects.length > 0 || _assignments.length > 0) {
      // If remote is empty but local has data, migrate local data up to Supabase
      for (const s of _subjects) {
        await supabase.from('subjects').insert(subjectToRow(s));
      }
      for (const a of _assignments) {
        await supabase.from('assignments').insert(assignmentToRow(a));
      }
    }

    _syncStatus = 'connected';
    _error = null;
    notify();
  } catch (err: unknown) {
    console.warn('[CampusFlow] Supabase sync issue (running in local mode):', err);
    _syncStatus = 'offline';
    const pgError = err as { message?: string };
    _error = pgError?.message || 'Could not connect to database.';
    notify();
  }
}

async function initialize() {
  if (_initialized) return;
  _initialized = true;

  await syncWithSupabase();

  // Subscribe to Realtime events
  try {
    supabase
      .channel('campusflow-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects' }, async () => {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('created_at', { ascending: true });
        if (!error && data) {
          _subjects = (data as SubjectRow[]).map(rowToSubject);
          notify();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, async () => {
        const { data, error } = await supabase
          .from('assignments')
          .select('*')
          .order('created_at', { ascending: true });
        if (!error && data) {
          _assignments = (data as AssignmentRow[]).map(rowToAssignment);
          notify();
        }
      })
      .subscribe();
  } catch (err) {
    console.warn('[CampusFlow] Realtime subscription error:', err);
  }
}

// ---------------------------------------------------------------------------
// The Hook
// ---------------------------------------------------------------------------

export function useStore(): StoreState {
  const [, rerender] = useState(0);

  useEffect(() => {
    const listener = () => rerender((n) => n + 1);
    _listeners.push(listener);
    initialize();
    return () => {
      _listeners = _listeners.filter((l) => l !== listener);
    };
  }, []);

  const refresh = useCallback(async () => {
    await syncWithSupabase();
  }, []);

  // -- Subjects --

  const addSubject = useCallback(async (subject: Subject) => {
    _subjects = [..._subjects, subject];
    notify();

    if (_syncStatus === 'connected') {
      try {
        await supabase.from('subjects').insert(subjectToRow(subject));
      } catch (err) {
        console.error('[CampusFlow] addSubject remote error:', err);
      }
    }
  }, []);

  const updateSubject = useCallback(async (id: string, updates: Partial<Subject>) => {
    const existing = _subjects.find((s) => s.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };

    _subjects = _subjects.map((s) => (s.id === id ? merged : s));
    notify();

    if (_syncStatus === 'connected') {
      try {
        const rowUpdates: Partial<SubjectRow> = {};
        if (updates.name !== undefined) rowUpdates.name = updates.name;
        if (updates.code !== undefined) rowUpdates.code = updates.code;
        if (updates.semester !== undefined) rowUpdates.semester = updates.semester;
        if (updates.faculty !== undefined) rowUpdates.faculty = updates.faculty ?? null;
        if (updates.description !== undefined) rowUpdates.description = updates.description ?? null;
        if (updates.color !== undefined) rowUpdates.color = updates.color;

        await supabase.from('subjects').update(rowUpdates).eq('id', id);
      } catch (err) {
        console.error('[CampusFlow] updateSubject remote error:', err);
      }
    }
  }, []);

  const deleteSubject = useCallback(async (id: string) => {
    _subjects = _subjects.filter((s) => s.id !== id);
    _assignments = _assignments.filter((a) => a.subjectId !== id);
    notify();

    if (_syncStatus === 'connected') {
      try {
        await supabase.from('subjects').delete().eq('id', id);
      } catch (err) {
        console.error('[CampusFlow] deleteSubject remote error:', err);
      }
    }
  }, []);

  // -- Assignments --

  const addAssignment = useCallback(async (assignment: Assignment) => {
    _assignments = [..._assignments, assignment];
    notify();

    if (_syncStatus === 'connected') {
      try {
        await supabase.from('assignments').insert(assignmentToRow(assignment));
      } catch (err) {
        console.error('[CampusFlow] addAssignment remote error:', err);
      }
    }
  }, []);

  const updateAssignment = useCallback(async (id: string, updates: Partial<Assignment>) => {
    const existing = _assignments.find((a) => a.id === id);
    if (!existing) return;
    const now = new Date().toISOString();
    const merged: Assignment = { ...existing, ...updates, updatedAt: now };

    _assignments = _assignments.map((a) => (a.id === id ? merged : a));
    notify();

    if (_syncStatus === 'connected') {
      try {
        const rowUpdates: Partial<AssignmentRow> = { updated_at: now };
        if (updates.subjectId !== undefined) rowUpdates.subject_id = updates.subjectId;
        if (updates.experimentNumber !== undefined) rowUpdates.experiment_number = updates.experimentNumber;
        if (updates.title !== undefined) rowUpdates.title = updates.title;
        if (updates.description !== undefined) rowUpdates.description = updates.description ?? null;
        if (updates.moodleUrl !== undefined) rowUpdates.moodle_url = updates.moodleUrl ?? null;
        if (updates.faculty !== undefined) rowUpdates.faculty = updates.faculty;
        if (updates.releaseDate !== undefined) rowUpdates.release_date = updates.releaseDate;
        if (updates.dueDate !== undefined) rowUpdates.due_date = updates.dueDate;
        if (updates.priority !== undefined) rowUpdates.priority = updates.priority;
        if (updates.status !== undefined) rowUpdates.status = updates.status;
        if (updates.checklist !== undefined) rowUpdates.checklist = updates.checklist ?? null;
        if (updates.facultyFeedback !== undefined) rowUpdates.faculty_feedback = updates.facultyFeedback ?? null;
        if (updates.notes !== undefined) rowUpdates.notes = updates.notes ?? null;

        await supabase.from('assignments').update(rowUpdates).eq('id', id);
      } catch (err) {
        console.error('[CampusFlow] updateAssignment remote error:', err);
      }
    }
  }, []);

  const deleteAssignment = useCallback(async (id: string) => {
    _assignments = _assignments.filter((a) => a.id !== id);
    notify();

    if (_syncStatus === 'connected') {
      try {
        await supabase.from('assignments').delete().eq('id', id);
      } catch (err) {
        console.error('[CampusFlow] deleteAssignment remote error:', err);
      }
    }
  }, []);

  return {
    subjects: _subjects,
    assignments: _assignments,
    isLoading: _isLoading,
    syncStatus: _syncStatus,
    error: _error,
    addSubject,
    updateSubject,
    deleteSubject,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    refresh,
  };
}

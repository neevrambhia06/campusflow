/**
 * useStore — Supabase-backed data store for CampusFlow.
 *
 * Exposes the same API as before so all pages/components work seamlessly:
 *   const { subjects, assignments, addSubject, updateSubject, ... } = useStore();
 *
 * Provides instant optimistic updates with background sync and rollback on error,
 * plus Supabase Realtime subscriptions for instantaneous cross-device sync.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Subject, Assignment, Checklist } from '@/types';

export const ALL_SEMESTERS = [
  'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
  'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8',
];

// ---------------------------------------------------------------------------
// Row types (Supabase snake_case)
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
// Mappers (snake_case ↔ camelCase)
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
    priority: row.priority as Assignment['priority'],
    status: row.status as Assignment['status'],
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
// Store state shape (returned by useStore)
// ---------------------------------------------------------------------------

interface StoreState {
  subjects: Subject[];
  assignments: Assignment[];
  isLoading: boolean;
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
// Singleton in-memory cache so all consumers share state without re-fetching
// ---------------------------------------------------------------------------

let _subjects: Subject[] = [];
let _assignments: Assignment[] = [];
let _isLoading = true;
let _error: string | null = null;
let _listeners: Array<() => void> = [];
let _initialized = false;

function notify() {
  _listeners.forEach((fn) => fn());
}

async function fetchFromSupabase() {
  const [subjectsResult, assignmentsResult] = await Promise.all([
    supabase.from('subjects').select('*').order('created_at', { ascending: true }),
    supabase.from('assignments').select('*').order('created_at', { ascending: true }),
  ]);

  if (subjectsResult.error) throw subjectsResult.error;
  if (assignmentsResult.error) throw assignmentsResult.error;

  _subjects = (subjectsResult.data as SubjectRow[]).map(rowToSubject);
  _assignments = (assignmentsResult.data as AssignmentRow[]).map(rowToAssignment);
  _error = null;
}

async function initialize() {
  if (_initialized) return;
  _initialized = true;

  try {
    await fetchFromSupabase();
  } catch (err: unknown) {
    console.error('[CampusFlow] Failed to load from Supabase:', err);
    const pgError = err as { code?: string; message?: string };
    if (pgError?.code === 'PGRST205') {
      _error = 'Database tables have not been created yet in your Supabase project. Run the SQL from supabase/schema.sql in your Supabase SQL Editor.';
    } else {
      _error = pgError?.message || (err instanceof Error ? err.message : 'Failed to connect to database.');
    }
  } finally {
    _isLoading = false;
    notify();
  }

  // Real-time subscriptions for cross-device sync
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
}

// ---------------------------------------------------------------------------
// The hook
// ---------------------------------------------------------------------------

export function useStore(): StoreState {
  const [, rerender] = useState(0);

  useEffect(() => {
    const listener = () => rerender((n) => n + 1);
    _listeners.push(listener);
    initialize(); // idempotent
    return () => {
      _listeners = _listeners.filter((l) => l !== listener);
    };
  }, []);

  const refresh = useCallback(async () => {
    _isLoading = true;
    notify();
    try {
      await fetchFromSupabase();
    } catch (err: unknown) {
      const pgError = err as { message?: string };
      _error = pgError?.message || 'Failed to refresh data.';
    } finally {
      _isLoading = false;
      notify();
    }
  }, []);

  // -- Subjects --

  const addSubject = useCallback(async (subject: Subject) => {
    // 1. Optimistic update
    const previous = _subjects;
    _subjects = [..._subjects, subject];
    notify();

    // 2. Background sync to Supabase
    try {
      const { error } = await supabase
        .from('subjects')
        .insert(subjectToRow(subject));
      if (error) throw error;
    } catch (err) {
      console.error('[CampusFlow] addSubject error:', err);
      // Revert optimistic update
      _subjects = previous;
      notify();
      throw err;
    }
  }, []);

  const updateSubject = useCallback(async (id: string, updates: Partial<Subject>) => {
    const existing = _subjects.find((s) => s.id === id);
    if (!existing) return;
    const previous = _subjects;
    const merged = { ...existing, ...updates };

    // 1. Optimistic update
    _subjects = _subjects.map((s) => (s.id === id ? merged : s));
    notify();

    // 2. Background sync to Supabase
    try {
      const rowUpdates: Partial<SubjectRow> = {};
      if (updates.name !== undefined) rowUpdates.name = updates.name;
      if (updates.code !== undefined) rowUpdates.code = updates.code;
      if (updates.semester !== undefined) rowUpdates.semester = updates.semester;
      if (updates.faculty !== undefined) rowUpdates.faculty = updates.faculty ?? null;
      if (updates.description !== undefined) rowUpdates.description = updates.description ?? null;
      if (updates.color !== undefined) rowUpdates.color = updates.color;

      const { error } = await supabase
        .from('subjects')
        .update(rowUpdates)
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('[CampusFlow] updateSubject error:', err);
      _subjects = previous;
      notify();
      throw err;
    }
  }, []);

  const deleteSubject = useCallback(async (id: string) => {
    const previousSubjects = _subjects;
    const previousAssignments = _assignments;

    // 1. Optimistic delete (cascade assignments locally too)
    _subjects = _subjects.filter((s) => s.id !== id);
    _assignments = _assignments.filter((a) => a.subjectId !== id);
    notify();

    // 2. Background delete
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('[CampusFlow] deleteSubject error:', err);
      _subjects = previousSubjects;
      _assignments = previousAssignments;
      notify();
      throw err;
    }
  }, []);

  // -- Assignments --

  const addAssignment = useCallback(async (assignment: Assignment) => {
    // 1. Optimistic update
    const previous = _assignments;
    _assignments = [..._assignments, assignment];
    notify();

    // 2. Background sync
    try {
      const { error } = await supabase
        .from('assignments')
        .insert(assignmentToRow(assignment));
      if (error) throw error;
    } catch (err) {
      console.error('[CampusFlow] addAssignment error:', err);
      _assignments = previous;
      notify();
      throw err;
    }
  }, []);

  const updateAssignment = useCallback(async (id: string, updates: Partial<Assignment>) => {
    const existing = _assignments.find((a) => a.id === id);
    if (!existing) return;
    const previous = _assignments;
    const now = new Date().toISOString();
    const merged: Assignment = { ...existing, ...updates, updatedAt: now };

    // 1. Optimistic update
    _assignments = _assignments.map((a) => (a.id === id ? merged : a));
    notify();

    // 2. Background sync
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

      const { error } = await supabase
        .from('assignments')
        .update(rowUpdates)
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('[CampusFlow] updateAssignment error:', err);
      _assignments = previous;
      notify();
      throw err;
    }
  }, []);

  const deleteAssignment = useCallback(async (id: string) => {
    const previous = _assignments;
    // 1. Optimistic delete
    _assignments = _assignments.filter((a) => a.id !== id);
    notify();

    // 2. Background delete
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('[CampusFlow] deleteAssignment error:', err);
      _assignments = previous;
      notify();
      throw err;
    }
  }, []);

  return {
    subjects: _subjects,
    assignments: _assignments,
    isLoading: _isLoading,
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

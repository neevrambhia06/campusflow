import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Assignment, Subject } from '../types';

export const ALL_SEMESTERS = [
  'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
  'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'
];

interface AppState {
  subjects: Subject[];
  assignments: Assignment[];
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  _hasRemovedMockData: boolean;
  setHasRemovedMockData: () => void;
}

const MOCK_SUBJECT_IDS = ['s1', 's2', 's3', 's4', 's5'];
const MOCK_ASSIGNMENT_IDS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      subjects: [],
      assignments: [],
      _hasRemovedMockData: false,
      setHasRemovedMockData: () => set((state) => ({ 
        _hasRemovedMockData: true,
        subjects: state.subjects.filter(s => !MOCK_SUBJECT_IDS.includes(s.id)),
        assignments: state.assignments.filter(a => !MOCK_ASSIGNMENT_IDS.includes(a.id))
      })),
      addAssignment: (assignment) =>
        set((state) => ({ assignments: [...state.assignments, assignment] })),
      updateAssignment: (id, updates) =>
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          ),
        })),
      deleteAssignment: (id) =>
        set((state) => ({
          assignments: state.assignments.filter((a) => a.id !== id),
        })),
      addSubject: (subject) =>
        set((state) => {
          return { subjects: [...state.subjects, subject] };
        }),
      updateSubject: (id, updates) =>
        set((state) => {
          return {
            subjects: state.subjects.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
          };
        }),
      deleteSubject: (id) =>
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== id),
          assignments: state.assignments.filter((a) => a.subjectId !== id)
        })),
    }),
    {
      name: 'campusflow-storage',
      onRehydrateStorage: () => (state) => {
        if (state && !state._hasRemovedMockData) {
          state.setHasRemovedMockData();
        }
      },
    }
  )
);

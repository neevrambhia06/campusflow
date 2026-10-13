-- ==============================================================================
-- CAMPUSFLOW — SUPABASE POSTGRES SCHEMA
-- ==============================================================================
-- Run this script in the Supabase SQL Editor:
-- Supabase Dashboard -> Your Project -> SQL Editor -> New query -> Paste & Run
-- ==============================================================================

-- 1. Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL DEFAULT '',
  semester TEXT NOT NULL,
  faculty TEXT,
  description TEXT,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create assignments (experiments) table
CREATE TABLE IF NOT EXISTS public.assignments (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  experiment_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  moodle_url TEXT,
  faculty TEXT NOT NULL DEFAULT '',
  release_date TEXT NOT NULL DEFAULT '',
  due_date TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'NOT_STARTED',
  checklist JSONB,
  faculty_feedback TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_assignments_subject_id ON public.assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON public.subjects(semester);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- 5. Permissive policies for personal single-user app (no auth required)
CREATE POLICY "Allow public select on subjects" 
  ON public.subjects FOR SELECT USING (true);

CREATE POLICY "Allow public insert on subjects" 
  ON public.subjects FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on subjects" 
  ON public.subjects FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete on subjects" 
  ON public.subjects FOR DELETE USING (true);

CREATE POLICY "Allow public select on assignments" 
  ON public.assignments FOR SELECT USING (true);

CREATE POLICY "Allow public insert on assignments" 
  ON public.assignments FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on assignments" 
  ON public.assignments FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete on assignments" 
  ON public.assignments FOR DELETE USING (true);

-- 6. Enable Realtime cross-device synchronization
ALTER TABLE public.subjects REPLICA IDENTITY FULL;
ALTER TABLE public.assignments REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.subjects;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assignments;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

import { useState } from 'react';
import { useStore, ALL_SEMESTERS } from '@/store/useStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, BookOpen, GitBranch, LayoutGrid } from 'lucide-react';
import { cn } from '@/utils';
import { Link } from 'react-router-dom';
import { SubjectFormModal } from '@/components/subjects/SubjectFormModal';
import { BranchedMenu } from '@/components/ui/BranchedMenu';

export function Subjects() {
  const { subjects, assignments } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'branched' | 'grid'>('branched');

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Curriculum Manager
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900">
            Subjects & Experiments
          </h1>
          <p className="mt-1 sm:mt-1.5 text-sm sm:text-base text-slate-500">
            Explore subjects and their connected experiments in a structured workflow tree.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('branched')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === 'branched'
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>Branched Tree</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === 'grid'
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <Button className="gap-2 shrink-0 shadow-sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Subject
          </Button>
        </div>
      </div>

      <div className="space-y-12">
        {subjects.length === 0 ? (
          <Card className="bg-slate-50/50 border-dashed">
            <CardContent className="p-16 text-center text-slate-500">
              <BookOpen className="h-12 w-12 mx-auto text-indigo-300 mb-4" />
              <p className="text-xl font-bold text-slate-700 mb-2">No subjects yet.</p>
              <p className="text-sm mb-6">Add your first subject to start organizing your college work.</p>
              <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Subject
              </Button>
            </CardContent>
          </Card>
        ) : (
          ALL_SEMESTERS.map(semester => {
            const semesterSubjects = subjects.filter(s => s.semester === semester);
            if (semesterSubjects.length === 0) return null;

            return (
              <section key={semester} className="space-y-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg sm:text-xl font-display font-extrabold text-slate-900 tracking-tight">
                    {semester}
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {semesterSubjects.length} {semesterSubjects.length === 1 ? 'Course' : 'Courses'}
                  </span>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>

                {/* 5. React Bits BranchedMenu View */}
                {viewMode === 'branched' ? (
                  <div className="space-y-5">
                    {semesterSubjects.map(subject => {
                      const subjectAssignments = assignments.filter(a => a.subjectId === subject.id);
                      return (
                        <BranchedMenu
                          key={subject.id}
                          subject={subject}
                          assignments={subjectAssignments}
                        />
                      );
                    })}
                  </div>
                ) : (
                  /* Classic Grid View */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {semesterSubjects.map(subject => {
                      const subjectAssignments = assignments.filter(a => a.subjectId === subject.id);
                      const completed = subjectAssignments.filter(a => a.status === 'COMPLETED').length;
                      const pending = subjectAssignments.length - completed;
                      const progress = subjectAssignments.length ? (completed / subjectAssignments.length) * 100 : 0;

                      return (
                        <Link to={`/subjects/${subject.id}`} key={subject.id}>
                          <Card className="hover:shadow-md transition-shadow group overflow-hidden flex flex-col h-full cursor-pointer">
                            <div className={cn("h-3 w-full", subject.color)} />
                            <CardContent className="p-6 flex-1 flex flex-col">
                              <div className="flex justify-between items-start mb-6">
                                <div>
                                  <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-[var(--color-primary)] transition-colors">{subject.code}</h3>
                                  <p className="text-sm text-slate-500 font-medium line-clamp-1" title={subject.name}>{subject.name}</p>
                                </div>
                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs", subject.color)}>
                                  <BookOpen className="h-5 w-5" />
                                </div>
                              </div>

                              <div className="space-y-4 flex-1 flex flex-col justify-end">
                                <div>
                                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-slate-500 uppercase tracking-wider">Progress</span>
                                    <span className="text-slate-900">{Math.round(progress)}%</span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full transition-all duration-500", subject.color)} style={{ width: `${progress}%` }} />
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
                                  <div className="text-center">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Total</p>
                                    <p className="text-lg font-bold text-slate-700">{subjectAssignments.length}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Pending</p>
                                    <p className="text-lg font-bold text-slate-700">{pending}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Completed</p>
                                    <p className="text-lg font-bold text-green-600">{completed}</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      <SubjectFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}

import { useState } from 'react';
import { useStore, ALL_SEMESTERS } from '@/store/useStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, BookOpen, Clock } from 'lucide-react';
import { cn } from '@/utils';
import { Link } from 'react-router-dom';
import { SubjectFormModal } from '@/components/subjects/SubjectFormModal';

export function Subjects() {
  const { subjects, assignments } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900">Subjects</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-500">Manage your course workload.</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto shrink-0" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </div>

      <div className="space-y-12">
        {subjects.length === 0 ? (
          <Card className="bg-slate-50/50 border-dashed">
            <CardContent className="p-16 text-center text-slate-500">
              <BookOpen className="h-12 w-12 mx-auto text-indigo-300 mb-4" />
              <p className="text-xl font-medium text-slate-700 mb-2">No subjects yet.</p>
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
              <section key={semester}>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wider">{semester}</h2>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {semesterSubjects.map(subject => {
                  const subjectAssignments = assignments.filter(a => a.subjectId === subject.id);
                  const completed = subjectAssignments.filter(a => a.status === 'COMPLETED').length;
                  const pending = subjectAssignments.length - completed;
                  const overdue = subjectAssignments.filter(a => a.status !== 'COMPLETED' && new Date(a.dueDate) < new Date()).length;
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
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0", subject.color)}>
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
                            
                            {overdue > 0 && (
                              <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 border border-red-100">
                                <Clock className="h-3.5 w-3.5" />
                                {overdue} overdue {overdue === 1 ? 'experiment' : 'experiments'}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
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

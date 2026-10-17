import { Link } from 'react-router-dom';
import { BookOpen, Trash2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Subject, Assignment } from '@/types';
import { cn } from '@/utils';

interface SubjectCardProps {
  subject: Subject;
  assignments: Assignment[];
  onDeleteSubject?: (subject: Subject) => void;
}

export function SubjectCard({ subject, assignments, onDeleteSubject }: SubjectCardProps) {
  const completed = assignments.filter((a) => a.status === 'COMPLETED').length;
  const pending = assignments.length - completed;
  const progress = assignments.length ? (completed / assignments.length) * 100 : 0;

  return (
    <Link to={`/subjects/${subject.id}`} className="block h-full group">
      <Card className="hover:shadow-md hover:border-indigo-300/80 transition-all overflow-hidden flex flex-col h-full cursor-pointer bg-white">
        <div className={cn('h-3.5 w-full', subject.color || 'bg-indigo-600')} />
        <CardContent className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="min-w-0 flex-1 mr-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {subject.code || 'CODE'}
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 mt-1.5 group-hover:text-indigo-600 transition-colors truncate" title={subject.name}>
                  {subject.name}
                </h3>
                {subject.faculty && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                    Prof. {subject.faculty}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {onDeleteSubject && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDeleteSubject(subject);
                    }}
                    title={`Delete ${subject.name}`}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}

                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs',
                    subject.color || 'bg-indigo-600'
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                </div>
              </div>
            </div>

            {subject.description && (
              <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                {subject.description}
              </p>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-500 uppercase tracking-wider text-[10px]">Progress</span>
                <span className="text-slate-900">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', subject.color || 'bg-indigo-600')}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">
                  Total
                </p>
                <p className="text-base font-bold text-slate-700">{assignments.length}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">
                  Pending
                </p>
                <p className="text-base font-bold text-amber-600">{pending}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">
                  Done
                </p>
                <p className="text-base font-bold text-emerald-600">{completed}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
              <span>View Experiments</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

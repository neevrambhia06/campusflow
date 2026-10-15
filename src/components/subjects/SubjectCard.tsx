import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Subject, Assignment } from '@/types';
import { cn } from '@/utils';

interface SubjectCardProps {
  subject: Subject;
  assignments: Assignment[];
}

export function SubjectCard({ subject, assignments }: SubjectCardProps) {
  const completed = assignments.filter((a) => a.status === 'COMPLETED').length;
  const pending = assignments.length - completed;
  const progress = assignments.length ? (completed / assignments.length) * 100 : 0;

  return (
    <Link to={`/subjects/${subject.id}`}>
      <Card className="hover:shadow-md transition-shadow group overflow-hidden flex flex-col h-full cursor-pointer">
        <div className={cn('h-3 w-full', subject.color)} />
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                {subject.code}
              </h3>
              <p className="text-sm text-slate-500 font-medium line-clamp-1" title={subject.name}>
                {subject.name}
              </p>
            </div>
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs',
                subject.color
              )}
            >
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
                <div
                  className={cn('h-full rounded-full transition-all duration-500', subject.color)}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">
                  Total
                </p>
                <p className="text-lg font-bold text-slate-700">{assignments.length}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">
                  Pending
                </p>
                <p className="text-lg font-bold text-slate-700">{pending}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">
                  Completed
                </p>
                <p className="text-lg font-bold text-green-600">{completed}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

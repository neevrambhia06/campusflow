import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { MagicBentoCard } from '@/components/ui/MagicBento';
import { Subject, Assignment } from '@/types';
import { cn } from '@/utils';

interface CoursesSnapshotCardProps {
  subjects: Subject[];
  assignments: Assignment[];
}

export function CoursesSnapshotCard({ subjects, assignments }: CoursesSnapshotCardProps) {
  return (
    <MagicBentoCard
      colSpan="md:col-span-2 lg:col-span-3"
      title="Courses Snapshot"
      description="Quick progress across all enrolled subjects for this semester."
      badge={`${subjects.length} Courses`}
      badgeColor="bg-slate-100 text-slate-700 border-slate-200"
      icon={<BookOpen className="h-5 w-5 text-indigo-600" />}
    >
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {subjects.map((subject) => {
          const courseAssignments = assignments.filter((a) => a.subjectId === subject.id);
          const completedCount = courseAssignments.filter((a) => a.status === 'COMPLETED').length;
          const totalCount = courseAssignments.length;
          const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <Link
              key={subject.id}
              to={`/subjects/${subject.id}`}
              className="p-4 rounded-2xl border border-slate-200/70 bg-white hover:bg-slate-50/70 hover:border-indigo-300/80 transition-all duration-200 group flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full shrink-0',
                        subject.color || 'bg-indigo-600'
                      )}
                    />
                    <span className="font-mono text-xs font-bold text-slate-900 truncate">
                      {subject.code || subject.name.substring(0, 4)}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                    {completedCount}/{totalCount}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-slate-600 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {subject.name}
                </h4>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1.5">
                  <span>Progress</span>
                  <span className="font-bold text-slate-700">{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', subject.color || 'bg-indigo-600')}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
        <Link
          to="/subjects"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1"
        >
          <span>View all subjects & branched tree</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </MagicBentoCard>
  );
}

import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { MagicBentoCard } from '@/components/ui/MagicBento';
import { Assignment, Subject } from '@/types';
import { cn } from '@/utils';

interface UpcomingDeadlinesCardProps {
  assignments: Assignment[];
  subjects: Subject[];
}

export function UpcomingDeadlinesCard({ assignments, subjects }: UpcomingDeadlinesCardProps) {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingDeadlines = assignments
    .filter(
      (a) => a.status !== 'COMPLETED' && new Date(a.dueDate) >= today && new Date(a.dueDate) <= nextWeek
    )
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <MagicBentoCard
      title="Upcoming Deadlines"
      description="Experiments due within the next 7 days."
      badge="Next 7 Days"
      icon={<Calendar className="h-5 w-5 text-indigo-600" />}
    >
      <div className="mt-2 space-y-3">
        {upcomingDeadlines.length > 0 ? (
          upcomingDeadlines.slice(0, 3).map((a) => {
            const subject = subjects.find((s) => s.id === a.subjectId);
            const dateObj = new Date(a.dueDate);

            return (
              <Link
                key={a.id}
                to={`/assignments/${a.id}`}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group block"
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex flex-col items-center justify-center shrink-0 text-white shadow-2xs',
                    subject?.color || 'bg-slate-400'
                  )}
                >
                  <span className="text-[9px] font-bold uppercase leading-none">
                    {dateObj.toLocaleString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-xs font-black leading-none mt-0.5">
                    {dateObj.getDate()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {a.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {subject?.name} · Exp {a.experimentNumber}
                  </p>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">
            No upcoming deadlines in the next 7 days.
          </p>
        )}
      </div>
    </MagicBentoCard>
  );
}

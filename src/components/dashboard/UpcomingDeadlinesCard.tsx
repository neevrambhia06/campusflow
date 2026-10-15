import { Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { MagicBentoCard } from '@/components/ui/MagicBento';
import { Assignment, Subject } from '@/types';
import { getDaysRemaining } from '@/utils';

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
      description="Submissions due in the next 7 days."
      badge="Next 7 Days"
      badgeColor="bg-slate-100 text-slate-700 border-slate-200"
      icon={<Calendar className="h-5 w-5 text-indigo-600" />}
    >
      <div className="mt-2 space-y-2.5">
        {upcomingDeadlines.length > 0 ? (
          upcomingDeadlines.slice(0, 3).map((a) => {
            const subject = subjects.find((s) => s.id === a.subjectId);
            const dateObj = new Date(a.dueDate);
            const daysLeft = getDaysRemaining(a.dueDate);

            return (
              <Link
                key={a.id}
                to={`/assignments/${a.id}`}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/70 hover:border-indigo-300/80 hover:bg-slate-50/70 transition-all duration-200 group block shadow-2xs"
              >
                {/* Aesthetic Calendar Date Chip */}
                <div className="w-11 h-12 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                  <div className="w-full bg-indigo-600 text-[8px] font-bold text-white text-center py-0.5 uppercase tracking-widest leading-none">
                    {dateObj.toLocaleString('en-US', { month: 'short' })}
                  </div>
                  <div className="flex-1 flex items-center justify-center text-sm font-black text-slate-900 leading-none">
                    {dateObj.getDate()}
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {a.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    <span className="font-semibold truncate">
                      {subject?.code || subject?.name || 'Subject'}
                    </span>
                    <span>•</span>
                    <span className="shrink-0 flex items-center gap-1 text-slate-500 font-medium">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                    </span>
                  </div>
                </div>

                <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors shrink-0">
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })
        ) : (
          <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-slate-100">
            <Calendar className="h-8 w-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-700">No deadlines this week</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              You are all caught up for the next 7 days.
            </p>
          </div>
        )}
      </div>
    </MagicBentoCard>
  );
}

import { useStore } from '@/store/useStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, ArrowRight } from 'lucide-react';
import { getDaysRemaining, cn } from '@/utils';
import { Link } from 'react-router-dom';

export function CalendarPage() {
  const { assignments, subjects } = useStore();

  const sortedAssignments = [...assignments].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  // Group by month
  const grouped = sortedAssignments.reduce((acc, assignment) => {
    const date = new Date(assignment.dueDate);
    const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(assignment);
    return acc;
  }, {} as Record<string, typeof assignments>);

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-slate-900">Calendar</h1>
        <p className="mt-2 text-slate-500">Upcoming deadlines and important dates.</p>
      </div>

      {assignments.length === 0 ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-xl border border-slate-100 shadow-soft">
          <Clock className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <p className="text-xl font-medium text-slate-700 mb-2">No upcoming deadlines.</p>
          <p className="text-sm">Deadlines will appear here once you add experiments.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([month, monthAssignments]) => (
            <section key={month}>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900">{month}</h2>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
              
              <div className="space-y-4">
                {monthAssignments.map(a => {
                  const subject = subjects.find(s => s.id === a.subjectId);
                  const daysLeft = getDaysRemaining(a.dueDate);
                  const isOverdue = daysLeft < 0 && a.status !== 'COMPLETED';
                  const isCompleted = a.status === 'COMPLETED';

                  return (
                    <Card key={a.id} className={cn("hover:shadow-md transition-all group", isCompleted ? "opacity-60" : "")}>
                      <CardContent className="p-0 flex flex-col sm:flex-row">
                        <div className={cn(
                          "sm:w-32 p-4 sm:p-6 flex sm:flex-col items-center justify-center gap-2 border-b sm:border-b-0 sm:border-r border-slate-100",
                          isCompleted ? "bg-slate-50" : subject?.color ? `${subject.color.replace('bg-', 'bg-').replace('500', '50')}` : "bg-slate-50"
                        )}>
                          <span className={cn(
                            "text-sm font-bold uppercase tracking-wider",
                            isCompleted ? "text-slate-400" : subject?.color ? subject.color.replace('bg-', 'text-') : "text-slate-500"
                          )}>
                            {new Date(a.dueDate).toLocaleString('en-US', { weekday: 'short' })}
                          </span>
                          <span className="text-3xl font-display font-bold text-slate-900">
                            {new Date(a.dueDate).getDate()}
                          </span>
                        </div>
                        
                        <div className="flex-1 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <Badge variant={subject?.color.includes('indigo') ? 'indigo' : 'secondary'} className="px-2 py-0.5 text-[10px]">
                                {subject?.code}
                              </Badge>
                              <span className="text-sm font-semibold text-slate-500">Experiment {a.experimentNumber}</span>
                              {a.priority === 'high' && !isCompleted && (
                                <span className="w-2 h-2 rounded-full bg-red-500" title="High Priority" />
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{a.title}</h3>
                          </div>
                          
                          <div className="flex items-center gap-6 sm:justify-end">
                            {!isCompleted && (
                              <div className={cn(
                                "text-sm font-semibold flex items-center gap-1.5",
                                isOverdue ? "text-red-600" : daysLeft <= 3 ? "text-amber-600" : "text-slate-500"
                              )}>
                                <Clock className="h-4 w-4" />
                                {isOverdue ? 'Overdue' : daysLeft === 0 ? 'Today' : `${daysLeft} days`}
                              </div>
                            )}
                            <Link 
                              to={`/assignments/${a.id}`}
                              className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                            >
                              <ArrowRight className="h-5 w-5" />
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

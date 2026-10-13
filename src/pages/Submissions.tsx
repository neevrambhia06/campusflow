import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/utils';
import { Link } from 'react-router-dom';

export function Submissions() {
  const { subjects, assignments } = useStore();

  const getReadinessCards = (type: 'midterm' | 'final') => {
    return subjects.map(subject => {
      const subjectAssignments = assignments
        .filter(a => a.subjectId === subject.id)
        .sort((a, b) => a.experimentNumber - b.experimentNumber);
      
      const targetAssignments = type === 'midterm' 
        ? subjectAssignments.slice(0, Math.ceil(subjectAssignments.length / 2)) 
        : subjectAssignments;
        
      if (targetAssignments.length === 0) return null;

      const completedCount = targetAssignments.filter(a => a.status === 'COMPLETED').length;
      const isReady = completedCount === targetAssignments.length;
      const progress = (completedCount / targetAssignments.length) * 100;

      return (
        <Card key={`${type}-${subject.id}`} className={cn("overflow-hidden transition-all", isReady ? "border-green-200" : "")}>
          <div className={cn("h-2 w-full", isReady ? "bg-green-500" : subject.color)} />
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg text-slate-900">{subject.name}</CardTitle>
                <p className="text-sm text-slate-500 mt-1 font-medium">{subject.code}</p>
              </div>
              <Badge variant={isReady ? "success" : "secondary"} className="shrink-0 text-sm py-1 px-3">
                {completedCount} / {targetAssignments.length}
              </Badge>
            </div>
            {!isReady && (
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-4">
                <div className={cn("h-full rounded-full transition-all duration-500", subject.color)} style={{ width: `${progress}%` }} />
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {targetAssignments.map(a => {
                const isCompleted = a.status === 'COMPLETED';
                const isCorrection = a.status === 'CORRECTION_REQUIRED';
                
                return (
                  <Link to={`/assignments/${a.id}`} key={a.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      ) : isCorrection ? (
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                      )}
                      <div>
                        <p className={cn("text-sm font-semibold", isCompleted ? "text-slate-500 line-through decoration-slate-300" : "text-slate-900")}>
                          Exp {a.experimentNumber}: {a.title}
                        </p>
                      </div>
                    </div>
                    {!isCompleted && (
                      <Badge variant={isCorrection ? "error" : "outline"} className="text-[10px] uppercase whitespace-nowrap ml-2">
                        {isCorrection ? 'Correction' : `${Object.values(a.checklist || {}).filter(Boolean).length} / 6`}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <div className="space-y-10 pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-slate-900">Submissions</h1>
        <p className="mt-2 text-slate-500">Track your readiness for mid-term and final journal submissions.</p>
      </div>

      {assignments.length === 0 ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-xl border border-slate-100 shadow-soft">
          <p className="text-xl font-medium text-slate-700 mb-2">No experiments available for submission tracking yet.</p>
          <p className="text-sm">Create subjects and experiments first.</p>
        </div>
      ) : (
        <>
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-2">
              <h2 className="text-xl font-bold text-slate-900">Mid-Term Submission</h2>
              <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider">Usually Exp 1-5</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getReadinessCards('midterm')}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-2">
              <h2 className="text-xl font-bold text-slate-900">Final Submission</h2>
              <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider">All Experiments</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getReadinessCards('final')}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

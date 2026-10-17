import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Calendar, ChevronRight, RefreshCw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatDate, getDaysRemaining, cn } from '@/utils';
import { ExperimentFormModal } from '@/components/assignments/ExperimentFormModal';
import { MoodleSyncModal } from '@/components/moodle';
import { MoodleExtractedExperiment } from '@/services/moodleService';

export function Assignments() {
  const { assignments, subjects } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMoodleModalOpen, setIsMoodleModalOpen] = useState(false);
  const [bookmarkletData, setBookmarkletData] = useState<MoodleExtractedExperiment[] | undefined>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Listen for bookmarklet sync payload in URL query params
  useEffect(() => {
    const rawSync = searchParams.get('moodle_sync');
    if (rawSync) {
      try {
        const parsed = JSON.parse(rawSync);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBookmarkletData(parsed);
          setIsMoodleModalOpen(true);
        }
      } catch (err) {
        console.warn('Could not parse bookmarklet payload from URL', err);
      }
      // Clean query parameter after reading
      searchParams.delete('moodle_sync');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredAssignments = [...assignments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900">Assignments</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-500">Track every experiment from Moodle to faculty approval.</p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            className="gap-2 flex-1 sm:flex-initial justify-center border-orange-200/80 bg-orange-50/40 text-orange-700 hover:bg-orange-100/60 hover:text-orange-800 transition-colors shadow-2xs font-semibold"
            onClick={() => setIsMoodleModalOpen(true)}
          >
            <RefreshCw className="h-4 w-4 text-orange-600" />
            <span>Sync Moodle</span>
          </Button>

          <Button className="gap-2 flex-1 sm:flex-initial justify-center shadow-xs" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Add Experiment</span>
          </Button>
        </div>
      </div>


      <div className="bg-white rounded-xl border border-slate-100 shadow-soft overflow-hidden">
        {filteredAssignments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredAssignments.map(a => {
              const subject = subjects.find(s => s.id === a.subjectId);
              const checklist = {
                moodleReceived: false,
                experimentWritten: false,
                experimentPerformed: false,
                templatePrepared: false,
                uploadedToMoodle: false,
                facultyChecked: false,
                ...(a.checklist || {})
              };
              const completedCount = Object.values(checklist).filter(Boolean).length;
              const progress = (completedCount / 6) * 100;
              
              return (
                <Link 
                  to={`/assignments/${a.id}`} 
                  key={a.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0 min-w-0">
                    <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-base sm:text-lg shadow-2xs", subject?.color || "bg-slate-200")}>
                      {(subject?.code || subject?.name || 'S').substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs sm:text-sm font-semibold text-slate-500 truncate">{subject?.name}</span>
                        <span className="text-sm text-slate-400">•</span>
                        <span className="text-xs sm:text-sm font-medium text-slate-900 shrink-0">Exp {a.experimentNumber}</span>
                        {a.priority === 'high' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 ml-1">HIGH</span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">{a.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right shrink-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-900 flex items-center gap-1.5 sm:justify-end mb-0.5 sm:mb-1">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                        {formatDate(a.dueDate)}
                      </p>
                      <p className={cn("text-xs font-semibold", getDaysRemaining(a.dueDate) < 0 ? "text-red-600" : "text-slate-500")}>
                        {getDaysRemaining(a.dueDate) < 0 ? 'Overdue' : `${getDaysRemaining(a.dueDate)} days left`}
                      </p>
                    </div>
                    
                    <div className="w-28 sm:w-32 flex flex-col items-end justify-center shrink-0">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">{completedCount} / 6 completed</p>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--color-primary)] rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      {a.status === 'CORRECTION_REQUIRED' && (
                        <Badge variant="error" className="mt-1.5 text-[10px] px-1.5 py-0">Correction</Badge>
                      )}
                    </div>

                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[var(--color-primary)] transition-colors hidden sm:block shrink-0" />
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500 bg-slate-50/50">
            <p className="text-xl font-medium text-slate-700 mb-2">No experiments yet.</p>
            <p className="text-sm mb-6">Add an experiment to start tracking your workflow.</p>
            <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Experiment
            </Button>
          </div>
        )}
      </div>

      <ExperimentFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <MoodleSyncModal
        isOpen={isMoodleModalOpen}
        onClose={() => {
          setIsMoodleModalOpen(false);
          setBookmarkletData(undefined);
        }}
        initialSyncData={bookmarkletData}
      />
    </div>
  );
}


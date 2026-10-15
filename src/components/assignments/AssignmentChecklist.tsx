import { CheckCircle2, AlertCircle } from 'lucide-react';
import { SpringCheck } from '@/components/ui/SpringCheck';
import { Checklist } from '@/types';
import { cn } from '@/utils';

interface AssignmentChecklistProps {
  checklist: Checklist;
  completedCount: number;
  totalCount: number;
  status: string;
  facultyFeedback?: string;
  onToggle: (key: keyof Checklist) => void;
}

export function AssignmentChecklist({
  checklist,
  completedCount,
  totalCount,
  status,
  facultyFeedback,
  onToggle,
}: AssignmentChecklistProps) {
  const checklistItems = [
    {
      key: 'moodleReceived' as const,
      title: 'Moodle Assignment Received',
      desc: 'Assignment received from Moodle and requirements have been read.',
    },
    {
      key: 'experimentWritten' as const,
      title: 'Experiment Written',
      desc: 'Experiment write-up has been completed.',
    },
    {
      key: 'experimentPerformed' as const,
      title: 'Experiment Performed',
      desc: 'Experiment has been completed in laboratory/simulator.',
    },
    {
      key: 'templatePrepared' as const,
      title: 'Template Prepared',
      desc: 'Moodle upload template has been prepared.',
    },
    {
      key: 'uploadedToMoodle' as const,
      title: 'Uploaded to Moodle',
      desc: 'Experiment/template has been uploaded to Moodle.',
    },
    {
      key: 'facultyChecked' as const,
      title: 'Faculty Checked',
      desc: 'Experiment has been checked by the respective faculty.',
    },
  ];

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900">
            Assignment Checklist
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Checkboxes are independent — complete tasks in any order you choose.
          </p>
        </div>
        {completedCount === totalCount && (
          <span className="text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 w-max flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Workflow Completed 🎉
          </span>
        )}
      </div>

      {status === 'CORRECTION_REQUIRED' && facultyFeedback && (
        <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100 text-red-900 flex gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold text-sm mb-1 text-red-800">Faculty Feedback</p>
            <p className="text-sm">{facultyFeedback}</p>
          </div>
        </div>
      )}

      {/* SpringCheck interactive checklist */}
      <div className="space-y-3">
        {checklistItems.map((item) => {
          const isChecked = checklist[item.key];
          return (
            <div
              key={item.key}
              className={cn(
                'p-4 rounded-xl border transition-all duration-200 bg-white',
                isChecked
                  ? 'bg-slate-50/70 border-slate-200'
                  : 'border-slate-200 hover:border-indigo-300 hover:shadow-xs'
              )}
            >
              <SpringCheck
                checked={isChecked}
                onChange={() => onToggle(item.key)}
                label={item.title}
                description={item.desc}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

import { Calendar, User, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Assignment } from '@/types';
import { formatDate, getAssignmentChecklistStatus } from '@/utils';

interface AssignmentSidebarProps {
  assignment: Assignment;
}

export function AssignmentSidebar({ assignment }: AssignmentSidebarProps) {
  const statusInfo = getAssignmentChecklistStatus(assignment);

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Status</span>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={statusInfo.variant} className="text-sm py-1 font-semibold">
              {statusInfo.label}
            </Badge>
          </div>
          {statusInfo.remainingCount > 0 && statusInfo.remainingCount < statusInfo.totalCount && (
            <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
              {statusInfo.remainingCount} {statusInfo.remainingCount === 1 ? 'task' : 'tasks'} left in checklist
            </p>
          )}
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Due Date</span>
          <p className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            {formatDate(assignment.dueDate)}
          </p>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Faculty</span>
          <p className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            {assignment.faculty || 'Not assigned'}
          </p>
        </div>

        {assignment.moodleUrl && (
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Moodle Resource</span>
            <a 
              href={assignment.moodleUrl} 
              target="_blank" 
              rel="noreferrer"
              className="text-sm font-semibold text-indigo-600 hover:underline flex items-center gap-1.5 break-all"
            >
              <LinkIcon className="h-4 w-4 shrink-0" />
              Open Moodle Link
            </a>
          </div>
        )}

        {assignment.description && (
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Description</span>
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
              {assignment.description}
            </p>
          </div>
        )}

        {assignment.notes && (
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Personal Notes</span>
            <p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100">
              {assignment.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

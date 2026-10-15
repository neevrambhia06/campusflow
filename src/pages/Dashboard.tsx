import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { MagicBentoGrid } from '@/components/ui/MagicBento';
import { Plus, CheckCircle2 } from 'lucide-react';
import { getDaysRemaining } from '@/utils';
import { ExperimentFormModal } from '@/components/assignments/ExperimentFormModal';
import {
  DashboardHeader,
  ActionRequiredCard,
  AcademicProgressCard,
  WorkflowDistributionCard,
  UpcomingDeadlinesCard,
} from '@/components/dashboard';

export function Dashboard() {
  const { assignments, subjects } = useStore();
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const attentionNeeded = assignments
    .filter(
      (a) =>
        a.status === 'CORRECTION_REQUIRED' ||
        a.status === 'READY_FOR_UPLOAD' ||
        (getDaysRemaining(a.dueDate) <= 3 &&
          a.status !== 'COMPLETED' &&
          a.status !== 'FACULTY_CHECKING')
    )
    .sort((a, b) => getDaysRemaining(a.dueDate) - getDaysRemaining(b.dueDate));

  const studentName = user?.name || 'Neev';

  return (
    <div className="space-y-8 pb-10">
      {/* Dashboard Top Greeting & Action Header */}
      <DashboardHeader
        studentName={studentName}
        onAddExperiment={() => setIsAddModalOpen(true)}
      />

      <ExperimentFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {assignments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-16 text-center text-slate-500 shadow-xs">
          <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4 animate-bounce" />
          <p className="text-xl font-bold text-slate-800 mb-2">You're all caught up!</p>
          <p className="text-sm mb-6 max-w-md mx-auto text-slate-500">
            No assignments have been added yet. Add your first college experiment to start
            tracking its full submission cycle.
          </p>
          <Button className="gap-2 w-full sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Experiment
          </Button>
        </div>
      ) : (
        /* React Bits Magic Bento Grid Layout */
        <MagicBentoGrid>
          {/* Bento Card 1: Urgent Actions Needed */}
          <ActionRequiredCard assignments={attentionNeeded} subjects={subjects} />

          {/* Bento Card 2: Academic Completion Summary */}
          <AcademicProgressCard assignments={assignments} />

          {/* Bento Card 3: 6-Stage Workflow Live Breakdown */}
          <WorkflowDistributionCard assignments={assignments} />

          {/* Bento Card 4: Upcoming 7-day deadlines */}
          <UpcomingDeadlinesCard assignments={assignments} subjects={subjects} />
        </MagicBentoGrid>
      )}
    </div>
  );
}

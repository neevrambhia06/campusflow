import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { MagicBentoGrid } from '@/components/ui/MagicBento';
import { Plus, CheckCircle2 } from 'lucide-react';
import { ExperimentFormModal } from '@/components/assignments/ExperimentFormModal';
import {
  DashboardHeader,
  ChecklistFilterCard,
  WorkflowDistributionCard,
  UpcomingDeadlinesCard,
  CoursesSnapshotCard,
} from '@/components/dashboard';

export function Dashboard() {
  const { assignments, subjects } = useStore();
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const studentName = user?.name || 'Neev';

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Dashboard Top Greeting, Live Date Capsule & Quick Metrics Strip */}
      <DashboardHeader
        studentName={studentName}
        assignments={assignments}
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
        /* 2. Premium React Bits Magic Bento Grid Layout */
        <MagicBentoGrid>
          {/* Top Bento Card: Checklist Workflow Hub with 6-stage checklist filters (replaces Action Required & Semester Momentum) */}
          <ChecklistFilterCard assignments={assignments} subjects={subjects} />

          {/* Bento Card 2: 6-Stage Submission Linear Pipeline (2 columns) */}
          <WorkflowDistributionCard assignments={assignments} />

          {/* Bento Card 3: Upcoming 7-day deadlines with calendar chips */}
          <UpcomingDeadlinesCard assignments={assignments} subjects={subjects} />

          {/* Bento Card 4: Courses Snapshot with mini progress meters (3 columns) */}
          {subjects.length > 0 && (
            <CoursesSnapshotCard subjects={subjects} assignments={assignments} />
          )}
        </MagicBentoGrid>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Layers, CheckCircle2, Bell, Clock, Smartphone, GitBranch } from 'lucide-react';
import { MagicBentoGrid, MagicBentoCard } from '@/components/ui/MagicBento';
import { Stepper, StepItem } from '@/components/ui/Stepper';
import { SpringCheck } from '@/components/ui/SpringCheck';

interface LandingFeaturesProps {
  onEnterWorkspace: () => void;
}

export function LandingFeatures({ onEnterWorkspace }: LandingFeaturesProps) {
  const [previewSteps, setPreviewSteps] = useState<StepItem[]>([
    { id: '1', title: 'Moodle Received', isCompleted: true },
    { id: '2', title: 'Write Exp', isCompleted: true },
    { id: '3', title: 'Perform Lab', isCompleted: true },
    { id: '4', title: 'Prep Template', isCompleted: false, isCurrent: true },
    { id: '5', title: 'Upload Moodle', isCompleted: false },
    { id: '6', title: 'Faculty Check', isCompleted: false },
  ]);

  const [demoChecks, setDemoChecks] = useState({
    moodle: true,
    write: true,
    perform: true,
    template: false,
    upload: false,
    faculty: false,
  });

  return (
    <section className="mt-20 sm:mt-28 w-full text-left">
      <div className="mb-8">
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Crafted around how college actually works
        </h2>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Interactive micro-interactions designed to make tracking academic assignments feel smooth.
        </p>
      </div>

      <MagicBentoGrid>
        {/* Bento Card 1: Interactive Stepper */}
        <MagicBentoCard
          colSpan="md:col-span-2"
          title="One Experiment = One Real Workflow"
          description="Each lab experiment transitions through realistic academic milestones."
          badge="React Bits Stepper"
          icon={<Layers className="h-5 w-5 text-indigo-600" />}
        >
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <Stepper
              steps={previewSteps}
              onStepClick={(idx) => {
                setPreviewSteps((prev) =>
                  prev.map((s, i) =>
                    i === idx
                      ? { ...s, isCompleted: !s.isCompleted }
                      : s
                  )
                );
              }}
            />
            <p className="text-[11px] text-slate-400 text-center mt-3">
              💡 Click any step to toggle completion state interactively!
            </p>
          </div>
        </MagicBentoCard>

        {/* Bento Card 2: Spring Checkboxes */}
        <MagicBentoCard
          title="Independent Checklist"
          description="No forced order. Complete write-up or perform lab in any order."
          badge="React Bits SpringCheck"
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
        >
          <div className="mt-3 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <SpringCheck
              checked={demoChecks.moodle}
              onChange={(c) => setDemoChecks({ ...demoChecks, moodle: c })}
              label="Moodle Received"
              description="Assignment details downloaded"
            />
            <SpringCheck
              checked={demoChecks.write}
              onChange={(c) => setDemoChecks({ ...demoChecks, write: c })}
              label="Experiment Written"
              description="Lab write-up completed"
            />
            <SpringCheck
              checked={demoChecks.perform}
              onChange={(c) => setDemoChecks({ ...demoChecks, perform: c })}
              label="Experiment Performed"
              description="Code / hardware test executed"
            />
          </div>
        </MagicBentoCard>

        {/* Bento Card 3: Push Notifications */}
        <MagicBentoCard
          title="Mobile & PC Push Notifications"
          description="Native alerts when experiments are due today, due tomorrow, or overdue."
          badge="System Push"
          icon={<Bell className="h-5 w-5 text-amber-500" />}
        >
          <div className="mt-2 space-y-2.5">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-xs flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900">⏰ Due Today: DBMS Exp 5</span>
                <p className="text-amber-800 text-[11px] mt-0.5">"Implement SQL Joins" is due today at 11:59 PM.</p>
              </div>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200/70 text-xs flex items-start gap-2.5">
              <Smartphone className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-indigo-900">Instant Phone & Laptop Alerts</span>
                <p className="text-indigo-800 text-[11px] mt-0.5">Stay updated across every device you study with.</p>
              </div>
            </div>
          </div>
        </MagicBentoCard>

        {/* Bento Card 4: Subject Hierarchy & Branching */}
        <MagicBentoCard
          colSpan="md:col-span-2"
          title="Subject & Experiment Branched Trees"
          description="Visual tree branching connects every semester, subject, and lab assignment."
          badge="React Bits BranchedMenu"
          icon={<GitBranch className="h-5 w-5 text-violet-600" />}
        >
          <div className="mt-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                DB
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900">Database Management Systems</span>
                <p className="text-xs text-slate-500">Semester 4 · 5 Experiments active</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onEnterWorkspace}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors"
            >
              View Branch →
            </button>
          </div>
        </MagicBentoCard>
      </MagicBentoGrid>
    </section>
  );
}

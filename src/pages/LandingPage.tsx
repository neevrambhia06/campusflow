import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { TechText } from '@/components/ui/TechText';
import { MagicBentoGrid, MagicBentoCard } from '@/components/ui/MagicBento';
import { Stepper, StepItem } from '@/components/ui/Stepper';
import { SpringCheck } from '@/components/ui/SpringCheck';
import { LoginModal } from '@/components/auth/LoginModal';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Bell, 
  Smartphone, 
  Layers, 
  GitBranch, 
  Clock
} from 'lucide-react';

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Interactive demo states for landing page previews
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

  const handleEnterApp = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-slate-900 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-600/30">
            C
          </div>
          <span className="font-display font-black text-xl text-slate-900 tracking-tight">
            CampusFlow
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20"
            >
              <span>Go to Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col items-center text-center">
        {/* Academic Workflow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 mb-6 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>Built for Engineering & College Submission Cycles</span>
        </div>

        {/* 1. React Bits TechText Wordmark */}
        <div className="mb-4">
          <TechText
            text="CampusFlow"
            subtext="ACADEMIC WORKFLOW TRACKER"
            glowColor="#4f46e5"
            onClick={handleEnterApp}
          />
        </div>

        {/* Hero Headline & Subtitle */}
        <h1 className="mt-4 max-w-3xl font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl tracking-tight text-slate-900 leading-tight">
          Never lose track of an experiment from Moodle to Faculty Approval.
        </h1>

        <p className="mt-4 sm:mt-6 max-w-2xl text-sm sm:text-lg text-slate-600 leading-relaxed">
          An experiment isn't just one task. CampusFlow organizes every step: 
          <strong> Write → Perform → Prepare Template → Upload → Faculty Checking → Completion.</strong>
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02]"
          >
            {/* Google Logo SVG */}
            <svg className="w-5 h-5 bg-white p-0.5 rounded-full" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          <button
            onClick={() => {
              if (!isAuthenticated) {
                setIsLoginModalOpen(true);
              } else {
                navigate('/dashboard');
              }
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-200/90 shadow-xs transition-all"
          >
            <span>Open Student Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Feature Highlights Bento Grid (MagicBento) */}
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
                  onClick={handleEnterApp}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                >
                  View Branch →
                </button>
              </div>
            </MagicBentoCard>
          </MagicBentoGrid>
        </section>

        {/* Bottom Banner */}
        <div className="mt-16 sm:mt-24 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white w-full text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
              Ready to streamline your submissions?
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200">
              Sign in with Google to sync your experiments across your laptop and phone in real time.
            </p>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 font-bold text-sm hover:bg-indigo-50 transition-all shadow-lg hover:scale-105"
            >
              <span>Get Started with Google</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
        <p>© 2026 CampusFlow · Academic Experiment Workflow Tracker</p>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => navigate('/dashboard')}
      />
    </div>
  );
}

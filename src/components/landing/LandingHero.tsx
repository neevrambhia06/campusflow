import { Sparkles, ArrowRight } from 'lucide-react';
import { TechText } from '@/components/ui/TechText';

interface LandingHeroProps {
  onOpenLogin: () => void;
  onEnterWorkspace: () => void;
}

export function LandingHero({ onOpenLogin, onEnterWorkspace }: LandingHeroProps) {
  return (
    <section className="flex flex-col items-center text-center">
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
          onClick={onEnterWorkspace}
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
          type="button"
          onClick={onOpenLogin}
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
          type="button"
          onClick={onEnterWorkspace}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-200/90 shadow-xs transition-all"
        >
          <span>Open Student Workspace</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

import { ArrowRight } from 'lucide-react';

interface LandingFooterProps {
  onOpenLogin: () => void;
}

export function LandingFooter({ onOpenLogin }: LandingFooterProps) {
  return (
    <>
      {/* Bottom CTA Banner */}
      <div className="mt-16 sm:mt-24 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white w-full text-center relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-xl mx-auto space-y-4">
          <h3 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
            Ready to streamline your submissions?
          </h3>
          <p className="text-xs sm:text-sm text-indigo-200">
            Sign in with Google to sync your experiments across your laptop and phone in real time.
          </p>
          <button
            type="button"
            onClick={onOpenLogin}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 font-bold text-sm hover:bg-indigo-50 transition-all shadow-lg hover:scale-105"
          >
            <span>Get Started with Google</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 w-full">
        <p>© 2026 CampusFlow · Academic Experiment Workflow Tracker</p>
      </footer>
    </>
  );
}

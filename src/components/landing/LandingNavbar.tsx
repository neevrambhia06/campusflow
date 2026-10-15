import { ArrowRight } from 'lucide-react';

interface LandingNavbarProps {
  isAuthenticated: boolean;
  onOpenLogin: () => void;
  onGoToWorkspace: () => void;
}

export function LandingNavbar({
  isAuthenticated,
  onOpenLogin,
  onGoToWorkspace,
}: LandingNavbarProps) {
  return (
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
            type="button"
            onClick={onGoToWorkspace}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20"
          >
            <span>Go to Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

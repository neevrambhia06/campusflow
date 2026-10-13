import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../ui/ToastContainer';
import { useLayoutStore } from '@/store/useLayoutStore';
import { useStore } from '@/store/useStore';
import { PanelTopOpen, Menu, PanelLeftOpen, Database, WifiOff } from 'lucide-react';
import { cn } from '@/utils';

export function Layout() {
  const { isLoading, error } = useStore();
  const { 
    isTopbarHidden, 
    toggleTopbarHidden, 
    isSidebarHidden, 
    toggleSidebarHidden, 
    toggleMobileSidebar 
  } = useLayoutStore();

  // --- Loading screen while Supabase fetches initial data ---
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center shadow-lg">
              <Database className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-2xl border-2 border-[var(--color-primary)] opacity-30 animate-ping" />
          </div>
          <div>
            <p className="font-display font-bold text-lg text-slate-900">CampusFlow</p>
            <p className="text-sm text-slate-500 mt-0.5">Connecting to database…</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Error screen if Supabase is unreachable or tables missing ---
  if (error) {
    const isSchemaMissing = error.toLowerCase().includes('schema') || error.toLowerCase().includes('table');
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center animate-fade-in">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
            {isSchemaMissing ? (
              <Database className="h-7 w-7 text-amber-600" />
            ) : (
              <WifiOff className="h-7 w-7 text-red-500" />
            )}
          </div>
          <p className="font-display font-bold text-xl text-slate-900 mb-1">
            {isSchemaMissing ? 'Database Setup Required' : 'Connection Error'}
          </p>
          <p className="text-sm text-slate-600 mb-4">
            {isSchemaMissing
              ? 'Your Supabase project is connected, but the database tables need to be created.'
              : 'Could not connect to the CampusFlow database.'}
          </p>

          {isSchemaMissing ? (
            <div className="text-left bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 text-xs text-slate-700 space-y-2">
              <p className="font-semibold text-slate-900">How to initialize tables (1 minute):</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>Open your <strong>Supabase Dashboard</strong></li>
                <li>Go to <strong>SQL Editor → New query</strong></li>
                <li>Copy and paste the code from <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">supabase/schema.sql</code></li>
                <li>Click <strong>Run</strong></li>
              </ol>
            </div>
          ) : (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg p-3 font-mono break-all mb-5">{error}</p>
          )}

          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            {isSchemaMissing ? "I've Run the SQL — Refresh" : 'Retry Connection'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      {/* Sidebar (handles desktop and mobile drawer) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Top Navbar */}
        {!isTopbarHidden && <Topbar />}

        {/* Floating Controls when Navbar is Hidden (Focus Mode) */}
        {isTopbarHidden && (
          <div className="fixed top-3 right-4 z-40 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-full border border-slate-200 shadow-md animate-fade-in">
            {/* Mobile menu trigger if navbar is hidden */}
            <button
              onClick={toggleMobileSidebar}
              className="md:hidden p-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Desktop sidebar toggle if both are hidden */}
            {isSidebarHidden && (
              <button
                onClick={toggleSidebarHidden}
                className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Show Sidebar"
                aria-label="Show Sidebar"
              >
                <PanelLeftOpen className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                <span>Sidebar</span>
              </button>
            )}

            {/* Restore Navbar Button */}
            <button
              onClick={toggleTopbarHidden}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors shadow-2xs"
              title="Show Navbar"
              aria-label="Show Navbar"
            >
              <PanelTopOpen className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              <span>Show Navbar</span>
            </button>
          </div>
        )}

        {/* Page Content with Mobile-Friendly Responsive Padding */}
        <main className={cn(
          "flex-1 overflow-y-auto relative transition-all",
          "p-4 sm:p-6 lg:p-8",
          isTopbarHidden && "pt-12 sm:pt-14"
        )}>
          <div className="mx-auto max-w-6xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}

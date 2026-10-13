import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../ui/ToastContainer';
import { useLayoutStore } from '@/store/useLayoutStore';
import { useStore } from '@/store/useStore';
import { PanelTopOpen, Menu, PanelLeftOpen, Database } from 'lucide-react';
import { cn } from '@/utils';
import { useState } from 'react';

export function Layout() {
  const { syncStatus } = useStore();
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const { 
    isTopbarHidden, 
    toggleTopbarHidden, 
    isSidebarHidden, 
    toggleSidebarHidden, 
    toggleMobileSidebar 
  } = useLayoutStore();

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

        {/* Helpful non-blocking banner if Supabase tables still need to be initialized */}
        {syncStatus === 'needs_schema' && !isBannerDismissed && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <strong>Cloud Sync Pending:</strong> Running in local mode. Run <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">supabase/schema.sql</code> in your Supabase SQL Editor to enable cross-device sync.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/settings"
                className="underline font-semibold hover:text-amber-800"
              >
                View Status
              </Link>
              <button
                onClick={() => setIsBannerDismissed(true)}
                className="text-amber-700 hover:text-amber-900 p-0.5 ml-1"
                aria-label="Dismiss banner"
              >
                ✕
              </button>
            </div>
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

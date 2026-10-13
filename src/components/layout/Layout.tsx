import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../ui/ToastContainer';
import { useLayoutStore } from '@/store/useLayoutStore';
import { PanelTopOpen, Menu, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/utils';

export function Layout() {
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

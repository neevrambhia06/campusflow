import { useState } from 'react';
import { Search, Menu, PanelLeftOpen, PanelLeftClose, PanelTopClose } from 'lucide-react';
import { useLayoutStore } from '@/store/useLayoutStore';
import { NotificationDropdown } from './NotificationDropdown';
import { UserMenu } from './UserMenu';
import { LoginModal } from '@/components/auth/LoginModal';
import { cn } from '@/utils';

export function Topbar() {
  const { 
    toggleMobileSidebar, 
    isSidebarHidden, 
    toggleSidebarHidden, 
    toggleTopbarHidden 
  } = useLayoutStore();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 shrink-0 transition-all gap-2 sm:gap-4 z-20">
      {/* Left section: Mobile menu button / Desktop sidebar toggle & Brand */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Brand (visible when sidebar is hidden on mobile) */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            C
          </div>
          <span className="font-display font-bold text-slate-900 text-lg">CampusFlow</span>
        </div>

        {/* Desktop Sidebar Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebarHidden}
          className={cn(
            "hidden md:flex items-center gap-1.5 p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
            isSidebarHidden && "bg-indigo-50 text-[var(--color-primary)] hover:bg-indigo-100 font-semibold"
          )}
          title={isSidebarHidden ? "Show Sidebar" : "Hide Sidebar"}
          aria-label={isSidebarHidden ? "Show Sidebar" : "Hide Sidebar"}
        >
          {isSidebarHidden ? (
            <>
              <PanelLeftOpen className="h-4 w-4" />
              <span className="hidden lg:inline text-xs">Show Sidebar</span>
            </>
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="hidden lg:inline text-xs text-slate-600">Hide Sidebar</span>
            </>
          )}
        </button>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-2">
        <div className="w-full relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="search"
            className="block w-full rounded-lg border-0 py-1.5 sm:py-2 pl-9 sm:pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[var(--color-primary)] text-xs sm:text-sm bg-slate-50 transition-all hover:bg-slate-100/50"
            placeholder="Search assignments..."
          />
        </div>
      </div>

      {/* Right Actions: Focus Mode, Notifications & User Account */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Hide Navbar (Focus Mode) Button */}
        <button
          type="button"
          onClick={toggleTopbarHidden}
          className="flex items-center gap-1.5 p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          title="Hide Navbar (Focus Mode)"
          aria-label="Hide Navbar"
        >
          <PanelTopClose className="h-4 w-4 text-slate-500" />
          <span className="hidden sm:inline text-xs text-slate-600">Hide Navbar</span>
        </button>

        {/* Interactive Notifications Dropdown */}
        <NotificationDropdown />

        {/* User Account Menu with Avatar & Auth Status */}
        <UserMenu onOpenLogin={() => setIsLoginModalOpen(true)} />
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
}

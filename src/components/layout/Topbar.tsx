import { useState, useRef, useEffect } from 'react';
import { Search, Menu, PanelLeftOpen, PanelLeftClose, PanelTopClose, LogOut, Sparkles, LogIn, ExternalLink } from 'lucide-react';
import { useLayoutStore } from '@/store/useLayoutStore';
import { useAuth } from '@/context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { LoginModal } from '@/components/auth/LoginModal';
import { Link } from 'react-router-dom';
import { cn } from '@/utils';

export function Topbar() {
  const { 
    toggleMobileSidebar, 
    isSidebarHidden, 
    toggleSidebarHidden, 
    toggleTopbarHidden 
  } = useLayoutStore();

  const { user, isAuthenticated, signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const displayName = user?.name || 'Neev Rambhia';
  const initial = displayName.charAt(0).toUpperCase();

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

      {/* Right Actions: Focus Mode, Notifications, Landing Link & User Profile */}
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

        {/* User Account / Sign In */}
        {isAuthenticated ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-100 transition-all"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="h-8 w-8 rounded-full object-cover border border-indigo-200"
                />
              ) : (
                <div 
                  className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs sm:text-sm shrink-0 border border-indigo-200 shadow-2xs"
                  title={displayName}
                >
                  {initial}
                </div>
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-fade-in p-2">
                <div className="p-3 border-b border-slate-100 bg-slate-50/50 rounded-xl mb-1">
                  <p className="font-display font-bold text-sm text-slate-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {user?.email || 'Student Account'}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full w-max">
                    <Sparkles className="h-3 w-3" />
                    <span>{user?.isGuest ? 'Guest Session' : 'Google Authenticated'}</span>
                  </div>
                </div>

                <Link
                  to="/"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Landing Page</span>
                </Link>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors shadow-2xs"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
}

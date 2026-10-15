import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, ExternalLink, LogOut, LogIn } from 'lucide-react';

interface UserMenuProps {
  onOpenLogin: () => void;
}

export function UserMenu({ onOpenLogin }: UserMenuProps) {
  const { user, isAuthenticated, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={onOpenLogin}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors shadow-2xs"
      >
        <LogIn className="h-3.5 w-3.5" />
        <span>Sign In</span>
      </button>
    );
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'Neev';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-100 transition-all focus:outline-none"
        aria-label="User Account Menu"
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
      {isOpen && (
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
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Landing Page</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
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
  );
}

import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Layers, 
  Calendar, 
  CheckSquare, 
  Settings, 
  X, 
  PanelLeftClose,
  Home
} from 'lucide-react';
import { cn } from '@/utils';
import { useLayoutStore } from '@/store/useLayoutStore';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Assignments', href: '/assignments', icon: BookOpen },
  { name: 'Subjects', href: '/subjects', icon: Layers },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Submissions', href: '/submissions', icon: CheckSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const { isMobileSidebarOpen, setMobileSidebarOpen, isSidebarHidden, toggleSidebarHidden } = useLayoutStore();
  const { user } = useAuth();
  const location = useLocation();

  const studentName = user?.name || 'Neev Rambhia';
  const initial = studentName.charAt(0).toUpperCase();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname, setMobileSidebarOpen]);

  const navLinks = (
    <div className="space-y-6">
      <nav className="space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={() => setMobileSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'group flex items-center px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all',
                isActive
                  ? 'bg-indigo-50 text-[var(--color-primary)] font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-[var(--color-primary)]' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                  aria-hidden="true"
                />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Landing Page link */}
      <div className="pt-4 border-t border-slate-100">
        <NavLink
          to="/"
          onClick={() => setMobileSidebarOpen(false)}
          className="group flex items-center px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <Home className="mr-3 h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
          <span>Home Landing Page</span>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden transition-opacity duration-300 animate-fade-in"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col md:hidden transition-transform duration-300 ease-in-out shadow-2xl",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              C
            </div>
            <span className="text-xl font-display font-bold text-slate-900 tracking-tight">CampusFlow</span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          {navLinks}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={studentName}
                className="h-9 w-9 rounded-full object-cover border border-indigo-200"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">{studentName}</p>
              <p className="text-xs text-slate-500 truncate">
                {user?.isGuest ? 'Guest Session' : user?.email || 'Academic Account'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out shrink-0 overflow-hidden",
          isSidebarHidden ? "w-0 border-r-0 opacity-0 pointer-events-none" : "w-64 opacity-100"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              C
            </div>
            <span className="text-xl font-display font-bold text-slate-900 tracking-tight">CampusFlow</span>
          </div>
          <button
            onClick={toggleSidebarHidden}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Hide Sidebar"
            aria-label="Hide Sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          {navLinks}
        </div>

        <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={studentName}
                className="h-8 w-8 rounded-full object-cover border border-indigo-200"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{studentName}</p>
              <p className="text-[10px] text-slate-400 truncate">Academic Workflow</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

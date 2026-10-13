import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Layers, Calendar, CheckSquare, Settings } from 'lucide-react';
import { cn } from '@/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Assignments', href: '/assignments', icon: BookOpen },
  { name: 'Subjects', href: '/subjects', icon: Layers },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Submissions', href: '/submissions', icon: CheckSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xl">
            C
          </div>
          <span className="text-xl font-display font-bold text-slate-900">CampusFlow</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                      isActive ? 'text-indigo-700' : 'text-slate-400 group-hover:text-slate-500'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

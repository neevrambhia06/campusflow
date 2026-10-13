import { Bell, Search } from 'lucide-react';

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div className="flex flex-1">
        <div className="w-full max-w-lg relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="search"
            className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[var(--color-primary)] sm:text-sm sm:leading-6 bg-slate-50 transition-all hover:bg-slate-100/50"
            placeholder="Search assignments, subjects..."
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" className="text-slate-400 hover:text-slate-500 relative">
          <span className="sr-only">View notifications</span>
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
          N
        </div>
      </div>
    </header>
  );
}

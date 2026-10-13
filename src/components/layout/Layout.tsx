import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../ui/ToastContainer';

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="mx-auto max-w-6xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

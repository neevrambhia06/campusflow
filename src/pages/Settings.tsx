import { useLayoutStore } from '@/store/useLayoutStore';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PanelLeft, PanelTop, RotateCcw, Database, Smartphone, Monitor, CheckCircle2, WifiOff } from 'lucide-react';
import { useToast } from '@/store/useToast';

export function SettingsPage() {
  const { 
    isSidebarHidden, 
    toggleSidebarHidden, 
    isTopbarHidden, 
    toggleTopbarHidden,
    resetLayout 
  } = useLayoutStore();
  
  const { subjects, assignments, isLoading, error } = useStore();
  const { addToast } = useToast();

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-500">Manage your layout preferences and workspace settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Navigation & Layout Display Options */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="h-5 w-5 text-[var(--color-primary)]" />
              Navigation & Layout Options
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <PanelTop className="h-4 w-4 text-slate-500" />
                  Top Navigation Bar
                </p>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Hide the top header bar to maximize vertical screen space (Focus Mode).
                </p>
              </div>
              <Button
                variant={isTopbarHidden ? "danger" : "outline"}
                size="sm"
                className="shrink-0"
                onClick={toggleTopbarHidden}
              >
                {isTopbarHidden ? "Hidden" : "Visible"}
              </Button>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <PanelLeft className="h-4 w-4 text-slate-500" />
                  Sidebar Navigation
                </p>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Hide the desktop left sidebar for full-width content viewing.
                </p>
              </div>
              <Button
                variant={isSidebarHidden ? "danger" : "outline"}
                size="sm"
                className="shrink-0"
                onClick={toggleSidebarHidden}
              >
                {isSidebarHidden ? "Hidden" : "Visible"}
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 justify-center"
                onClick={() => {
                  resetLayout();
                  addToast("Layout reset to default.");
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Reset Layout to Default
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mobile & Responsiveness Info */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-indigo-600" />
              Mobile Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
              <p className="text-sm font-semibold text-slate-800">Mobile Navigation Drawer</p>
              <p className="text-xs sm:text-sm text-slate-600">
                On phones and small screens, navigation automatically converts into a slide-over drawer accessed via the hamburger menu button in the topbar.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
              <p className="text-sm font-semibold text-slate-800">Floating Focus Controls</p>
              <p className="text-xs sm:text-sm text-slate-600">
                When the topbar is hidden, a floating control pill remains pinned to the top right so you can restore navigation at any time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Database & Sync Status */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-violet-600" />
              Database & Cross-Device Sync
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {/* Sync status banner */}
            <div className={`flex items-center gap-3 rounded-xl p-4 mb-6 border ${error ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
              {error ? (
                <>
                  <WifiOff className="h-5 w-5 text-red-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Database Disconnected</p>
                    <p className="text-xs text-red-600 mt-0.5">{error}</p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Connected to Supabase</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Your data syncs in real-time across all your devices — laptop, phone, and tablet.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subjects</span>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {isLoading ? '…' : subjects.length}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Experiments</span>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {isLoading ? '…' : assignments.length}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
                <p className="text-xl font-bold text-green-600 mt-0.5">
                  {isLoading ? '…' : assignments.filter(a => a.status === 'COMPLETED').length}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Storage</span>
                <p className="text-sm font-bold text-violet-700 mt-0.5">Supabase ☁</p>
              </div>
            </div>

            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
              <p className="text-sm font-semibold text-violet-900 mb-1">Cross-Device Sync Active</p>
              <p className="text-xs text-violet-700">
                All subjects and experiments are stored in Supabase PostgreSQL and stream live to every device 
                you open CampusFlow on. No manual sync needed — changes appear within seconds.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

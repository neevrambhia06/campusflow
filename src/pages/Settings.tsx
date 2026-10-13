import { useLayoutStore } from '@/store/useLayoutStore';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PanelLeft, PanelTop, RotateCcw, Database, Smartphone, Monitor, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '@/store/useToast';
import { useState } from 'react';

export function SettingsPage() {
  const { 
    isSidebarHidden, 
    toggleSidebarHidden, 
    isTopbarHidden, 
    toggleTopbarHidden,
    resetLayout 
  } = useLayoutStore();
  
  const { subjects, assignments, syncStatus, error, refresh } = useStore();
  const { addToast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
      addToast("Checked database connection.");
    } finally {
      setIsRefreshing(false);
    }
  };

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
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-violet-600" />
                Database & Cloud Sync
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Status</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {/* Sync status banner */}
            {syncStatus === 'connected' && (
              <div className="flex items-center gap-3 rounded-xl p-4 mb-6 border bg-green-50 border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-900">Connected to Supabase Cloud</p>
                  <p className="text-xs text-green-700 mt-0.5">
                    Your subjects and assignments are synced live across laptop, phone, and tablet.
                  </p>
                </div>
              </div>
            )}

            {syncStatus === 'needs_schema' && (
              <div className="rounded-xl p-4 mb-6 border bg-amber-50 border-amber-200 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Database Tables Pending</p>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Connected to Supabase, but the <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">subjects</code> and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">assignments</code> tables have not been created yet.
                    </p>
                  </div>
                </div>
                <div className="bg-white/80 border border-amber-200 rounded-lg p-3 text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">Quick 30-second setup:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                    <li>Open your <strong>Supabase Dashboard → SQL Editor</strong></li>
                    <li>Copy & paste code from <code className="bg-slate-100 px-1 rounded font-mono">supabase/schema.sql</code></li>
                    <li>Click <strong>Run</strong>, then click <em>Refresh Status</em> above</li>
                  </ol>
                </div>
              </div>
            )}

            {syncStatus === 'offline' && (
              <div className="flex items-center gap-3 rounded-xl p-4 mb-6 border bg-slate-50 border-slate-200">
                <Database className="h-5 w-5 text-slate-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Operating in Local Mode</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Data is saved locally on your device. {error ? `(${error})` : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subjects</span>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{subjects.length}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Experiments</span>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{assignments.length}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
                <p className="text-xl font-bold text-green-600 mt-0.5">
                  {assignments.filter(a => a.status === 'COMPLETED').length}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mode</span>
                <p className="text-sm font-bold text-violet-700 mt-0.5">
                  {syncStatus === 'connected' ? 'Cloud Synced ☁' : 'Offline / Local'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

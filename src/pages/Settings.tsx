import { useLayoutStore } from '@/store/useLayoutStore';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PanelLeft, PanelTop, RotateCcw, Trash2, ShieldCheck, Smartphone, Monitor } from 'lucide-react';
import { useState } from 'react';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { useToast } from '@/store/useToast';

export function SettingsPage() {
  const { 
    isSidebarHidden, 
    toggleSidebarHidden, 
    isTopbarHidden, 
    toggleTopbarHidden,
    resetLayout 
  } = useLayoutStore();
  
  const { subjects, assignments } = useStore();
  const { addToast } = useToast();
  const [isResetDataOpen, setIsResetDataOpen] = useState(false);

  const handleClearData = () => {
    localStorage.removeItem('campusflow-storage');
    window.location.reload();
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

        {/* Workspace Data Info */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              Workspace Data & Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
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
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Storage Mode</span>
                <p className="text-xl font-bold text-slate-900 mt-0.5">Local</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-900">Reset Local Storage</p>
                <p className="text-xs text-slate-500">Clear all locally stored subjects and assignments.</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                className="gap-2 w-full sm:w-auto"
                onClick={() => setIsResetDataOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog
        isOpen={isResetDataOpen}
        onClose={() => setIsResetDataOpen(false)}
        onConfirm={handleClearData}
        title="Reset All Local Data?"
        message="This action will permanently delete all subjects and assignments stored in your browser. This cannot be undone."
        confirmText="Delete Everything"
        isDestructive={true}
      />
    </div>
  );
}

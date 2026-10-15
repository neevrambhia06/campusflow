import { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Send, 
  Smartphone, 
  Check, 
  X, 
  Sliders, 
  Sparkles,
  Inbox,
  RotateCcw
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Link } from 'react-router-dom';
import { getDaysRemaining } from '@/utils';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendTestNotification, 
  checkAndNotifyDeadlines,
  NotificationPermissionState 
} from '@/utils/notifications';

type NotificationTab = 'all' | 'deadlines' | 'settings';

const STORAGE_KEY = 'campusflow_dismissed_notifications';

export function NotificationDropdown() {
  const { assignments, subjects } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [permission, setPermission] = useState<NotificationPermissionState>(getNotificationPermission());
  const [isTesting, setIsTesting] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check device permission on open
  useEffect(() => {
    setPermission(getNotificationPermission());
  }, [isOpen]);

  // Check assignments on load and trigger notifications if due
  useEffect(() => {
    if (permission === 'granted' && assignments.length > 0) {
      checkAndNotifyDeadlines(assignments, subjects);
    }
  }, [permission, assignments, subjects]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Urgent assignments (due within 3 days or overdue)
  const urgentAssignments = assignments
    .filter((a) => a.status !== 'COMPLETED' && !dismissedIds.includes(a.id))
    .map((a) => {
      const days = getDaysRemaining(a.dueDate);
      const subject = subjects.find((s) => s.id === a.subjectId);
      return { ...a, days, subject };
    })
    .sort((a, b) => a.days - b.days);

  const deadlineOnlyList = urgentAssignments.filter(a => a.days <= 3);

  const handleEnableNotifications = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      await sendTestNotification();
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      await sendTestNotification();
    } finally {
      setIsTesting(false);
    }
  };

  const handleDismissAll = () => {
    const allIds = urgentAssignments.map(a => a.id);
    setDismissedIds(prev => {
      const updated = Array.from(new Set([...prev, ...allIds]));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save dismissed notifications:', err);
      }
      return updated;
    });
  };

  const handleDismissSingle = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissedIds(prev => {
      const updated = Array.from(new Set([...prev, id]));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save dismissed notification:', err);
      }
      return updated;
    });
  };

  const handleRestoreAll = () => {
    setDismissedIds([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear dismissed notifications:', err);
    }
  };

  const displayList = activeTab === 'deadlines' ? deadlineOnlyList : urgentAssignments;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        aria-label="View notifications"
      >
        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        {deadlineOnlyList.length > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {deadlineOnlyList.length}
          </span>
        )}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs sm:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto right-auto sm:right-0 top-18 sm:top-full mt-2 w-auto sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-fade-in flex flex-col max-h-[85vh] sm:max-h-[580px]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900 leading-tight">Notifications</h3>
                <p className="text-[11px] text-slate-500">Deadlines & workspace updates</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {urgentAssignments.length > 0 && activeTab !== 'settings' && (
                <button
                  onClick={handleDismissAll}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-200/60 transition-colors"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-slate-100 bg-white px-2 pt-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Inbox className="h-3.5 w-3.5" />
              <span>All</span>
              {urgentAssignments.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {urgentAssignments.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('deadlines')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'deadlines'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Deadlines</span>
              {deadlineOnlyList.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                  {deadlineOnlyList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Device Push</span>
              {permission === 'granted' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" />
              )}
            </button>
          </div>

          {/* Tab 1 & 2: List Content */}
          {(activeTab === 'all' || activeTab === 'deadlines') && (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
              {/* Push status banner if not granted yet */}
              {permission !== 'granted' && (
                <div className="m-2 p-3 rounded-xl bg-indigo-50/80 border border-indigo-100/80 flex items-start gap-2.5">
                  <Smartphone className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-slate-900">Get Mobile & PC Alerts</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">Allow push notifications to be alerted before deadlines.</p>
                    <button
                      onClick={handleEnableNotifications}
                      className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-semibold text-[11px] hover:bg-indigo-700 transition-colors shadow-2xs"
                    >
                      Enable Push Notifications
                    </button>
                  </div>
                </div>
              )}

              {displayList.length > 0 ? (
                displayList.map((a) => (
                  <Link
                    key={a.id}
                    to={`/assignments/${a.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-start gap-3 p-3.5 rounded-xl hover:bg-slate-50 transition-colors group relative"
                  >
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      a.days < 0 
                        ? 'bg-red-50 text-red-600' 
                        : a.days === 0 
                        ? 'bg-amber-50 text-amber-600' 
                        : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {a.days < 0 ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {a.subject?.code || a.subject?.name || 'Subject'} · Exp {a.experimentNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          a.days < 0 
                            ? 'bg-red-100 text-red-700' 
                            : a.days === 0 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {a.days < 0 
                            ? `${Math.abs(a.days)}d Overdue` 
                            : a.days === 0 
                            ? 'Due Today' 
                            : `${a.days}d left`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate">{a.title}</p>
                    </div>

                    <button
                      onClick={(e) => handleDismissSingle(a.id, e)}
                      title="Dismiss alert"
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-opacity absolute right-3 top-3.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeTab === 'deadlines' 
                      ? 'No experiments due in the next 3 days.' 
                      : 'No pending experiments needing attention.'}
                  </p>
                  {dismissedIds.length > 0 && (
                    <button
                      onClick={handleRestoreAll}
                      className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors py-1.5 px-3 rounded-lg bg-indigo-50/80 hover:bg-indigo-100"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore cleared notifications
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Settings Content */}
          {activeTab === 'settings' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Smartphone className="h-4 w-4 text-indigo-600" />
                    Push Status on this Device
                  </span>
                  {permission === 'granted' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <Check className="h-3 w-3" /> Active
                    </span>
                  ) : permission === 'denied' ? (
                    <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                      Blocked
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Not Configured
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600">
                  When enabled, CampusFlow sends native system alerts on Windows, macOS, Android, and iOS when experiments are due or need review.
                </p>

                <div className="pt-2 flex flex-col gap-2">
                  {permission !== 'granted' ? (
                    <button
                      onClick={handleEnableNotifications}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors shadow-2xs"
                    >
                      Enable Device Notifications
                    </button>
                  ) : (
                    <button
                      onClick={handleTestNotification}
                      disabled={isTesting}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold text-xs hover:bg-indigo-100 transition-colors"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {isTesting ? 'Sending Alert…' : 'Send Test Notification to Screen'}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-500">
                <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800">Automatic Timing</p>
                    <p className="mt-0.5">Alerts trigger at 9:00 AM on the day an experiment is due, and 24 hours before deadline.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-semibold">
            <Link
              to="/assignments"
              onClick={() => setIsOpen(false)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              All assignments →
            </Link>
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-800"
            >
              Preferences
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

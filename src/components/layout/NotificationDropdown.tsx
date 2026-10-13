import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Clock, Send, Smartphone, Check, X } from 'lucide-react';
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

export function NotificationDropdown() {
  const { assignments, subjects } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermissionState>(getNotificationPermission());
  const [isTesting, setIsTesting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check device permission on mount
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
    .filter((a) => a.status !== 'COMPLETED')
    .map((a) => {
      const days = getDaysRemaining(a.dueDate);
      const subject = subjects.find((s) => s.id === a.subjectId);
      return { ...a, days, subject };
    })
    .filter((a) => a.days <= 3)
    .sort((a, b) => a.days - b.days);

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
        aria-label="View notifications"
      >
        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        {urgentAssignments.length > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs">
            {urgentAssignments.length}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto right-auto sm:right-0 top-16 sm:top-full mt-2 w-auto sm:w-88 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-indigo-600" />
              <h3 className="font-display font-bold text-sm text-slate-900">Notifications & Alerts</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 sm:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* System Push Notification Control Card */}
          <div className="p-3.5 bg-gradient-to-r from-indigo-50/70 to-violet-50/70 border-b border-indigo-100/60">
            <div className="flex items-start gap-2.5">
              <Smartphone className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900">
                  Mobile & PC Push Notifications
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Receive alerts on your screen when experiments are due or need review.
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  {permission === 'granted' ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        <Check className="h-3 w-3" /> Enabled on this device
                      </span>
                      <button
                        onClick={handleTestNotification}
                        disabled={isTesting}
                        className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 underline inline-flex items-center gap-1"
                      >
                        <Send className="h-2.5 w-2.5" />
                        {isTesting ? 'Sending…' : 'Test Alert'}
                      </button>
                    </div>
                  ) : permission === 'denied' ? (
                    <span className="text-[11px] text-red-600 font-medium">
                      Blocked in browser settings. Click lock icon in URL bar to enable.
                    </span>
                  ) : (
                    <button
                      onClick={handleEnableNotifications}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-2xs"
                    >
                      Enable Notifications
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Urgent Deadlines List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {urgentAssignments.length > 0 ? (
              urgentAssignments.map((a) => (
                <Link
                  key={a.id}
                  to={`/assignments/${a.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 p-3.5 hover:bg-slate-50 transition-colors block text-left"
                >
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
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
                    <p className="text-xs text-slate-600 truncate mt-0.5">{a.title}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-400 mb-2" />
                <p className="text-xs font-medium text-slate-600">All caught up!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No urgent deadlines right now.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center">
            <Link
              to="/assignments"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View all assignments →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

import { Smartphone, Check, Send, Sparkles } from 'lucide-react';
import { NotificationPermissionState } from '@/utils/notifications';

interface NotificationPushSettingsProps {
  permission: NotificationPermissionState;
  isTesting: boolean;
  onEnable: () => void;
  onTest: () => void;
}

export function NotificationPushSettings({
  permission,
  isTesting,
  onEnable,
  onTest,
}: NotificationPushSettingsProps) {
  return (
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
          When enabled, CampusFlow sends native system alerts on Windows, macOS, Android, and iOS
          when experiments are due or need review.
        </p>

        <div className="pt-2 flex flex-col gap-2">
          {permission !== 'granted' ? (
            <button
              type="button"
              onClick={onEnable}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              Enable Device Notifications
            </button>
          ) : (
            <button
              type="button"
              onClick={onTest}
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
            <p className="mt-0.5">
              Alerts trigger at 9:00 AM on the day an experiment is due, and 24 hours before deadline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

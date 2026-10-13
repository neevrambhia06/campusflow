import { Assignment, Subject } from '@/types';
import { getDaysRemaining } from '@/utils';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const result = await Notification.requestPermission();
    return result as NotificationPermissionState;
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return 'denied';
  }
}

export async function sendDeviceNotification(
  title: string, 
  options?: {
    body?: string;
    tag?: string;
    url?: string;
    data?: any;
  }
): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const notificationOptions: NotificationOptions = {
    body: options?.body,
    tag: options?.tag || 'campusflow-alert',
    icon: '/vite.svg',
    badge: '/vite.svg',
    data: { url: options?.url || '/assignments', ...(options?.data || {}) },
  };

  // Try service worker first for mobile devices
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, notificationOptions);
        return true;
      }
    } catch {
      // fallback to standard Notification
    }
  }

  // Standard PC/browser notification fallback
  try {
    const notification = new Notification(title, notificationOptions);
    notification.onclick = () => {
      window.focus();
      if (options?.url) {
        window.location.href = options.url;
      }
      notification.close();
    };
    return true;
  } catch (err) {
    console.error('Failed to trigger Notification:', err);
    return false;
  }
}

export async function sendTestNotification(): Promise<boolean> {
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    return false;
  }

  return sendDeviceNotification('CampusFlow Notifications Enabled! 🎓', {
    body: 'You will now receive experiment deadline reminders on this device (mobile & PC).',
    tag: 'campusflow-test',
    url: '/assignments',
  });
}

/**
 * Checks assignments and notifies user for any experiments due today, tomorrow, or overdue.
 * Limits alerts to at most once per day per experiment to avoid notification spam.
 */
export function checkAndNotifyDeadlines(assignments: Assignment[], subjects: Subject[]) {
  if (getNotificationPermission() !== 'granted') return;

  const todayStr = new Date().toISOString().split('T')[0];

  assignments.forEach((assignment) => {
    // Only check unfinished experiments
    if (assignment.status === 'COMPLETED') return;

    const daysLeft = getDaysRemaining(assignment.dueDate);
    const subject = subjects.find((s) => s.id === assignment.subjectId);
    const subjectCode = subject?.code || subject?.name || 'Subject';

    let alertTitle = '';
    let alertBody = '';

    if (daysLeft < 0) {
      alertTitle = `⚠️ Overdue Experiment: ${subjectCode} Exp ${assignment.experimentNumber}`;
      alertBody = `"${assignment.title}" is overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) > 1 ? 's' : ''}!`;
    } else if (daysLeft === 0) {
      alertTitle = `⏰ Due Today: ${subjectCode} Exp ${assignment.experimentNumber}`;
      alertBody = `"${assignment.title}" is due today. Complete your checklist now!`;
    } else if (daysLeft === 1) {
      alertTitle = `⏳ Due Tomorrow: ${subjectCode} Exp ${assignment.experimentNumber}`;
      alertBody = `"${assignment.title}" is due tomorrow.`;
    }

    if (alertTitle) {
      const notificationKey = `cf_notif_${assignment.id}_${todayStr}_${daysLeft}`;
      if (!localStorage.getItem(notificationKey)) {
        sendDeviceNotification(alertTitle, {
          body: alertBody,
          tag: `assignment-${assignment.id}`,
          url: `/assignments/${assignment.id}`,
        });
        localStorage.setItem(notificationKey, 'true');
      }
    }
  });
}

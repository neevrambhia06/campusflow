import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString?: string | null): string {
  if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
    return 'No due date';
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'No due date';
  }
  try {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getDaysRemaining(dateString?: string | null): number {
  if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
    return 999;
  }
  const due = new Date(dateString);
  if (isNaN(due.getTime())) {
    return 999;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export * from './assignmentStatus';


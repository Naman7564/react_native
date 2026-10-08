/**
 * Date utility functions for parsing, formatting, and calculating relative dates.
 */

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  } else if (hour >= 17 && hour < 22) {
    return 'Good evening';
  } else {
    return 'Good night';
  }
}

export function formatHeaderDate(): { dayName: string; formattedDate: string } {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return { dayName, formattedDate };
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isDueToday(isoDate?: string): boolean {
  if (!isoDate) return false;
  const target = new Date(isoDate);
  const now = new Date();
  return isSameDay(target, now);
}

export function isDueTomorrow(isoDate?: string): boolean {
  if (!isoDate) return false;
  const target = new Date(isoDate);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(target, tomorrow);
}

export function isOverdue(isoDate?: string, completed?: boolean): boolean {
  if (!isoDate || completed) return false;
  const target = new Date(isoDate);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return target.getTime() < todayStart.getTime();
}

export function formatDisplayDate(isoDate?: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = compareDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';

  const isCurrentYear = date.getFullYear() === now.getFullYear();
  if (isCurrentYear) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getQuickDatePresets(): { label: string; date: Date }[] {
  const now = new Date();

  // Today
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);

  // Tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // This Weekend (Saturday)
  const weekend = new Date(today);
  const dayOfWeek = weekend.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
  weekend.setDate(weekend.getDate() + daysUntilSaturday);

  // Next Week (Next Monday)
  const nextMonday = new Date(today);
  const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);

  return [
    { label: 'Today', date: today },
    { label: 'Tomorrow', date: tomorrow },
    { label: 'This Weekend', date: weekend },
    { label: 'Next Week', date: nextMonday },
  ];
}

export function toISODateOnly(date: Date): string {
  return date.toISOString().split('T')[0];
}

export type ReminderStatus = "overdue" | "dueSoon" | "upcoming";

export interface ReminderGroups<T> {
  overdue: T[];
  dueSoon: T[];
  upcoming: T[];
}

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** A reminder is "due soon" when its date is today or within the next 3 days. */
export function reminderStatus(dueDate: Date, now: Date = new Date()): ReminderStatus {
  const due = startOfDay(dueDate).getTime();
  const today = startOfDay(now).getTime();
  if (due < today) return "overdue";
  if (due - today <= 3 * DAY_MS) return "dueSoon";
  return "upcoming";
}

export function groupReminders<T extends { dueDate: Date }>(
  items: T[],
  now: Date = new Date(),
): ReminderGroups<T> {
  const groups: ReminderGroups<T> = { overdue: [], dueSoon: [], upcoming: [] };
  for (const item of items) {
    groups[reminderStatus(item.dueDate, now)].push(item);
  }
  const byDate = (a: T, b: T) => a.dueDate.getTime() - b.dueDate.getTime();
  groups.overdue.sort(byDate);
  groups.dueSoon.sort(byDate);
  groups.upcoming.sort(byDate);
  return groups;
}

/** "2026-11-25" -> "25 November 2026" (parsed as UTC so the day never shifts). */
export function formatIsoDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

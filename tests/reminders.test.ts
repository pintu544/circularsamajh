import { describe, expect, it } from "vitest";
import { groupReminders, reminderStatus, formatIsoDate } from "@/lib/reminders";

const NOW = new Date("2026-11-18T10:00:00+05:30");

describe("reminderStatus", () => {
  it("marks a past date overdue", () => {
    expect(reminderStatus(new Date("2026-11-14T00:00:00Z"), NOW)).toBe("overdue");
  });

  it("marks today as due soon", () => {
    expect(reminderStatus(new Date("2026-11-18T00:00:00Z"), NOW)).toBe("dueSoon");
  });

  it("marks a date within three days as due soon", () => {
    expect(reminderStatus(new Date("2026-11-21T00:00:00Z"), NOW)).toBe("dueSoon");
  });

  it("marks a later date as upcoming", () => {
    expect(reminderStatus(new Date("2026-12-05T00:00:00Z"), NOW)).toBe("upcoming");
  });
});

describe("groupReminders", () => {
  it("groups and sorts each bucket by due date", () => {
    const items = [
      { id: "a", dueDate: new Date("2026-12-05T00:00:00Z") },
      { id: "b", dueDate: new Date("2026-11-14T00:00:00Z") },
      { id: "c", dueDate: new Date("2026-11-27T00:00:00Z") },
      { id: "d", dueDate: new Date("2026-11-20T00:00:00Z") },
      { id: "e", dueDate: new Date("2026-11-10T00:00:00Z") },
    ];
    const groups = groupReminders(items, NOW);
    expect(groups.overdue.map((i) => i.id)).toEqual(["e", "b"]);
    expect(groups.dueSoon.map((i) => i.id)).toEqual(["d"]);
    expect(groups.upcoming.map((i) => i.id)).toEqual(["c", "a"]);
  });
});

describe("formatIsoDate", () => {
  it("renders an ISO date in long en-GB form without shifting the day", () => {
    expect(formatIsoDate("2026-11-14")).toBe("14 November 2026");
    expect(formatIsoDate("2026-12-05")).toBe("5 December 2026");
  });
});

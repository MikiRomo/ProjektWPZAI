import { describe, expect, it } from "vitest";

import { buildMonthCalendar, getDayKey, groupSchedulesByDay } from "./calendarService";
import type { WateringSchedule } from "../domain/types";

describe("calendarService", () => {
  it("getDayKey should return YYYY-MM-DD", () => {
    expect(getDayKey(new Date("2026-04-13T10:20:00.000Z"))).toBe("2026-04-13");
  });

  it("groupSchedulesByDay should count schedules per day", () => {
    const schedules: WateringSchedule[] = [
      {
        plantId: "plant-1",
        lastWateredAt: null,
        nextWateringAt: "2026-04-13T10:00:00.000Z",
        isOverdue: false,
      },
      {
        plantId: "plant-2",
        lastWateredAt: null,
        nextWateringAt: "2026-04-13T14:00:00.000Z",
        isOverdue: false,
      },
    ];

    const grouped = groupSchedulesByDay(schedules);
    expect(grouped["2026-04-13"]).toBe(2);
  });

  it("buildMonthCalendar should return 42 cells", () => {
    const cells = buildMonthCalendar(new Date("2026-04-01T00:00:00.000Z"), []);
    expect(cells).toHaveLength(42);
  });
});

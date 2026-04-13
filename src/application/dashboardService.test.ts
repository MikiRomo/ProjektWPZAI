import { describe, expect, it } from "vitest";

import {
  buildSchedules,
  getStartOfDay,
  groupSchedulesForDashboard,
} from "./dashboardService";
import type { Plant, WateringSchedule } from "../domain/types";

/**
 * Tworzy testowy obiekt rośliny.
 * @param id Identyfikator rośliny.
 * @param frequency Częstotliwość podlewania w dniach.
 * @returns Gotowy obiekt rośliny.
 * @example
 * const plant = createPlant("plant-1", 7);
 */
function createPlant(id: string, frequency: number): Plant {
  return {
    id,
    name: `Plant ${id}`,
    species: "Test species",
    wateringFrequencyDays: frequency,
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  };
}

describe("dashboardService", () => {
  it("getStartOfDay should zero-out time", () => {
    const result = getStartOfDay(new Date("2026-04-13T17:42:11.000Z"));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });

  it("buildSchedules should create one schedule per plant", () => {
    const plants = [createPlant("plant-1", 2), createPlant("plant-2", 5)];
    const schedules = buildSchedules(
      plants,
      {
        "plant-1": "2026-04-10T00:00:00.000Z",
        "plant-2": "2026-04-10T00:00:00.000Z",
      },
      new Date("2026-04-12T00:00:00.000Z"),
    );
    expect(schedules).toHaveLength(2);
    expect(schedules[0].plantId).toBe("plant-1");
  });

  it("groupSchedulesForDashboard should split schedules by status", () => {
    const schedules: WateringSchedule[] = [
      {
        plantId: "plant-overdue",
        lastWateredAt: "2026-04-01T00:00:00.000Z",
        nextWateringAt: "2026-04-12T10:00:00.000Z",
        isOverdue: true,
      },
      {
        plantId: "plant-today",
        lastWateredAt: "2026-04-10T00:00:00.000Z",
        nextWateringAt: "2026-04-13T18:00:00.000Z",
        isOverdue: false,
      },
      {
        plantId: "plant-upcoming",
        lastWateredAt: "2026-04-12T00:00:00.000Z",
        nextWateringAt: "2026-04-14T08:00:00.000Z",
        isOverdue: false,
      },
    ];

    const groups = groupSchedulesForDashboard(
      schedules,
      new Date("2026-04-13T10:00:00.000Z"),
    );

    expect(groups.overdue).toHaveLength(1);
    expect(groups.dueToday).toHaveLength(1);
    expect(groups.upcoming).toHaveLength(1);
  });
});

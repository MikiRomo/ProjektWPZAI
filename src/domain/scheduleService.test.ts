import {
  addDays,
  calculateNextWateringDate,
  createWateringAction,
  createWateringSchedule,
  getPlantsDueForWatering,
} from "./scheduleService";
import { describe, expect, it } from "vitest";
import type { Plant, WateringSchedule } from "./types";

/**
 * Tworzy obiekt rośliny do testów jednostkowych.
 * @param overrides Nadpisane wartości dla domyślnego obiektu rośliny.
 * @returns Kompletna roślina gotowa do użycia w teście.
 * @example
 * const plant = createTestPlant({ wateringFrequencyDays: 3 });
 */
function createTestPlant(overrides: Partial<Plant> = {}): Plant {
  return {
    id: "plant-1",
    name: "Monstera",
    species: "Monstera deliciosa",
    wateringFrequencyDays: 7,
    createdAt: "2026-04-01T10:00:00.000Z",
    updatedAt: "2026-04-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("scheduleService", () => {
  it("addDays should add full number of days", () => {
    const result = addDays(new Date("2026-04-01T00:00:00.000Z"), 5);
    expect(result.toISOString()).toBe("2026-04-06T00:00:00.000Z");
  });

  it("calculateNextWateringDate should use provided last watering date", () => {
    const plant = createTestPlant({ wateringFrequencyDays: 3 });
    const nextDate = calculateNextWateringDate(plant, "2026-04-10T10:00:00.000Z");
    expect(nextDate.toISOString()).toBe("2026-04-13T10:00:00.000Z");
  });

  it("createWateringSchedule should mark schedule as overdue", () => {
    const plant = createTestPlant({ wateringFrequencyDays: 2 });
    const schedule = createWateringSchedule(
      plant,
      "2026-04-01T08:00:00.000Z",
      new Date("2026-04-10T08:00:00.000Z"),
    );
    expect(schedule.isOverdue).toBe(true);
  });

  it("createWateringSchedule should set nextWateringAt correctly", () => {
    const plant = createTestPlant({ wateringFrequencyDays: 4 });
    const schedule = createWateringSchedule(
      plant,
      "2026-04-03T09:30:00.000Z",
      new Date("2026-04-05T09:30:00.000Z"),
    );
    expect(schedule.nextWateringAt).toBe("2026-04-07T09:30:00.000Z");
    expect(schedule.isOverdue).toBe(false);
  });

  it("createWateringAction should create a WATERING history entry", () => {
    const action = createWateringAction("plant-1", "2026-04-13T08:00:00.000Z");
    expect(action).toEqual({
      id: "plant-1-2026-04-13T08:00:00.000Z",
      plantId: "plant-1",
      type: "WATERING",
      performedAt: "2026-04-13T08:00:00.000Z",
    });
  });

  it("getPlantsDueForWatering should return only due schedules", () => {
    const schedules: WateringSchedule[] = [
      {
        plantId: "plant-1",
        lastWateredAt: "2026-04-01T00:00:00.000Z",
        nextWateringAt: "2026-04-05T00:00:00.000Z",
        isOverdue: true,
      },
      {
        plantId: "plant-2",
        lastWateredAt: "2026-04-03T00:00:00.000Z",
        nextWateringAt: "2026-04-20T00:00:00.000Z",
        isOverdue: false,
      },
    ];

    const dueSchedules = getPlantsDueForWatering(
      schedules,
      new Date("2026-04-10T00:00:00.000Z"),
    );

    expect(dueSchedules).toHaveLength(1);
    expect(dueSchedules[0].plantId).toBe("plant-1");
  });
});

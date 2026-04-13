import { describe, expect, it } from "vitest";

import {
  APP_STATE_STORAGE_KEY,
  addPlant,
  addPlantWithOptionalWatering,
  createAppState,
  createInitialAppState,
  getLatestWateringByPlantId,
  loadAppState,
  markPlantWatered,
  removePlant,
  resolvePerformedAt,
  saveAppState,
  updatePlant,
  type StorageLike,
} from "./appStateService";
import type { CareAction, Plant } from "../domain/types";

/**
 * Tworzy prosty magazyn w pamięci do testowania persystencji.
 * @returns Obiekt kompatybilny z localStorage.
 * @example
 * const storage = createMemoryStorage();
 */
function createMemoryStorage(): StorageLike {
  const memory = new Map<string, string>();

  return {
    getItem(key: string): string | null {
      return memory.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      memory.set(key, value);
    },
  };
}

/**
 * Buduje testową roślinę do operacji na stanie.
 * @param id Identyfikator rośliny.
 * @returns Obiekt rośliny.
 * @example
 * const plant = createPlant("plant-1");
 */
function createPlant(id: string): Plant {
  return {
    id,
    name: "Test plant",
    species: "Test species",
    wateringFrequencyDays: 5,
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  };
}

describe("appStateService", () => {
  it("loadAppState should return initial state when storage is empty", () => {
    const storage = createMemoryStorage();
    const state = loadAppState(storage, APP_STATE_STORAGE_KEY);
    expect(state.plants.length).toBeGreaterThan(0);
    expect(state.version).toBe(1);
  });

  it("saveAppState and loadAppState should persist data", () => {
    const storage = createMemoryStorage();
    const sourceState = createInitialAppState();

    saveAppState(storage, APP_STATE_STORAGE_KEY, sourceState);
    const loadedState = loadAppState(storage, APP_STATE_STORAGE_KEY);

    expect(loadedState.plants).toHaveLength(sourceState.plants.length);
    expect(loadedState.careActions).toHaveLength(sourceState.careActions.length);
  });

  it("getLatestWateringByPlantId should pick newest watering action", () => {
    const actions: CareAction[] = [
      {
        id: "a1",
        plantId: "plant-1",
        type: "WATERING",
        performedAt: "2026-04-10T00:00:00.000Z",
      },
      {
        id: "a2",
        plantId: "plant-1",
        type: "WATERING",
        performedAt: "2026-04-13T00:00:00.000Z",
      },
    ];

    const latest = getLatestWateringByPlantId(actions);
    expect(latest["plant-1"]).toBe("2026-04-13T00:00:00.000Z");
  });

  it("addPlant should append plant and keep state consistent", () => {
    const state = createAppState([createPlant("plant-1")], []);
    const nextState = addPlant(state, createPlant("plant-2"));
    expect(nextState.plants).toHaveLength(2);
    expect(nextState.schedules).toHaveLength(2);
  });

  it("markPlantWatered should append watering action", () => {
    const state = createAppState([createPlant("plant-1")], []);
    const nextState = markPlantWatered(state, "plant-1", "2026-04-13T12:00:00.000Z");
    expect(nextState.careActions).toHaveLength(1);
    expect(nextState.careActions[0].type).toBe("WATERING");
  });

  it("resolvePerformedAt should keep planned future timestamp", () => {
    const resolved = resolvePerformedAt(
      "2026-04-13T10:01:00.000Z",
      "2026-04-15T09:00:00.000Z",
    );
    expect(resolved).toBe("2026-04-15T09:00:00.000Z");
  });

  it("addPlantWithOptionalWatering should add first watering action", () => {
    const state = createAppState([], []);
    const nextState = addPlantWithOptionalWatering(
      state,
      createPlant("plant-1"),
      "2026-04-13T10:00:00.000Z",
    );
    expect(nextState.plants).toHaveLength(1);
    expect(nextState.careActions).toHaveLength(1);
  });

  it("removePlant should remove plant and linked history", () => {
    const state = createAppState([createPlant("plant-1")], [
      {
        id: "action-1",
        plantId: "plant-1",
        type: "WATERING",
        performedAt: "2026-04-13T10:00:00.000Z",
      },
    ]);
    const nextState = removePlant(state, "plant-1");
    expect(nextState.plants).toHaveLength(0);
    expect(nextState.careActions).toHaveLength(0);
  });

  it("updatePlant should replace plant details", () => {
    const state = createAppState([createPlant("plant-1")], []);
    const nextState = updatePlant(state, {
      ...state.plants[0],
      name: "Updated name",
      wateringFrequencyDays: 2,
    });
    expect(nextState.plants[0].name).toBe("Updated name");
    expect(nextState.plants[0].wateringFrequencyDays).toBe(2);
  });
});

import { describe, expect, it } from "vitest";

import {
  createPlantFromForm,
  deserializeCareAction,
  deserializePlant,
  serializeCareAction,
  serializePlant,
} from "./usePlants";
import type { CareAction, PlantFormData } from "../types";

describe("usePlants helpers", () => {
  it("serializePlant should convert Date fields to ISO strings", () => {
    const input = createPlantFromForm(
      {
        name: "Monstera",
        species: "Monstera deliciosa",
        wateringIntervalDays: 7,
        lastWatered: new Date("2026-04-10T10:00:00.000Z"),
      },
      new Date("2026-04-13T10:00:00.000Z"),
    );

    const serialized = serializePlant(input);
    expect(serialized.createdAt).toBe("2026-04-13T10:00:00.000Z");
    expect(serialized.lastWatered).toBe("2026-04-10T10:00:00.000Z");
  });

  it("deserializePlant should parse ISO strings back to Date", () => {
    const deserialized = deserializePlant({
      id: "1",
      name: "Monstera",
      species: "Monstera deliciosa",
      wateringIntervalDays: 7,
      createdAt: "2026-04-13T10:00:00.000Z",
      lastWatered: "2026-04-10T10:00:00.000Z",
    });

    expect(deserialized.createdAt).toBeInstanceOf(Date);
    expect(deserialized.lastWatered).toBeInstanceOf(Date);
  });

  it("serializeCareAction and deserializeCareAction should preserve date", () => {
    const action: CareAction = {
      id: "1",
      plantId: "p1",
      type: "WATERING",
      performedAt: new Date("2026-04-11T10:00:00.000Z"),
    };

    const serialized = serializeCareAction(action);
    const deserialized = deserializeCareAction(serialized);
    expect(deserialized.performedAt.toISOString()).toBe("2026-04-11T10:00:00.000Z");
  });

  it("createPlantFromForm should create plant with id and createdAt", () => {
    const formData: PlantFormData = {
      name: "Fikus",
      species: "Ficus elastica",
      wateringIntervalDays: 5,
      lastWatered: new Date("2026-04-12T10:00:00.000Z"),
    };

    const plant = createPlantFromForm(formData, new Date("2026-04-13T10:00:00.000Z"));
    expect(plant.id).toBeDefined();
    expect(plant.createdAt.toISOString()).toBe("2026-04-13T10:00:00.000Z");
  });
});

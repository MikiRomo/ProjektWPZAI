import { describe, expect, it } from "vitest";

import { makePlant } from "./helpers";
import { calculateHealthScore, getNextWateringDate } from "../watering";
import { validatePlantForm } from "../validation";

describe("getNextWateringDate", () => {
  it("zwraca date = lastWatered + interval gdy roslina jest aktualna", () => {
    const plant = makePlant({ lastWatered: new Date("2024-01-01"), wateringIntervalDays: 7 });
    expect(getNextWateringDate(plant)).toEqual(new Date("2024-01-08"));
  });

  it("zwraca date w przeszlosci gdy roslina jest zalegla", () => {
    const plant = makePlant({ lastWatered: new Date("2024-01-01"), wateringIntervalDays: 3 });
    const result = getNextWateringDate(plant);
    expect(result < new Date("2024-01-10")).toBe(true);
  });

  it("obsluguje lastWatered = today (wlasnie podlana)", () => {
    const today = new Date("2024-01-10T00:00:00.000Z");
    const plant = makePlant({ lastWatered: today, wateringIntervalDays: 7 });
    const result = getNextWateringDate(plant);
    expect(result > today).toBe(true);
  });
});

describe("calculateHealthScore", () => {
  it("zwraca 100 gdy roslina podlana dzisiaj", () => {
    const now = new Date("2024-01-10T00:00:00.000Z");
    const plant = makePlant({ lastWatered: now, wateringIntervalDays: 7 });
    expect(calculateHealthScore(plant, now)).toBe(100);
  });

  it("zwraca 0 gdy zalegla o wiecej niz 2x interwal", () => {
    const lastWatered = new Date("2024-01-01");
    const now = new Date("2024-01-20");
    const plant = makePlant({ lastWatered, wateringIntervalDays: 7 });
    expect(calculateHealthScore(plant, now)).toBe(0);
  });

  it("zwraca wartosc miedzy 0 a 100 dla normalnego opoznienia", () => {
    const lastWatered = new Date("2024-01-01");
    const now = new Date("2024-01-09");
    const plant = makePlant({ lastWatered, wateringIntervalDays: 7 });
    const score = calculateHealthScore(plant, now);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });
});

describe("validatePlantForm", () => {
  it("odrzuca pusta nazwe", () => {
    const result = validatePlantForm({
      name: "",
      species: "Monstera",
      wateringIntervalDays: 7,
      lastWatered: new Date("2024-01-01"),
    });
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual(expect.objectContaining({ field: "name" }));
  });

  it("odrzuca interwal podlewania poza zakresem 1-365", () => {
    const result = validatePlantForm({
      name: "Test",
      species: "Test",
      wateringIntervalDays: 0,
      lastWatered: new Date("2024-01-01"),
    });
    expect(result.success).toBe(false);
  });

  it("akceptuje poprawne dane", () => {
    const result = validatePlantForm({
      name: "Monstera",
      species: "Monstera deliciosa",
      wateringIntervalDays: 7,
      lastWatered: new Date("2024-01-10"),
    });
    expect(result.success).toBe(true);
  });
});

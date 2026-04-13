import type { Plant } from "../../types";

/**
 * Tworzy poprawny obiekt rośliny do testów z możliwością nadpisania pól.
 * @param overrides Pola do nadpisania domyślnej rośliny.
 * @returns Obiekt rośliny do użycia w testach.
 * @example
 * const plant = makePlant({ wateringIntervalDays: 3 });
 */
export function makePlant(overrides: Partial<Plant> = {}): Plant {
  return {
    id: "plant-1",
    name: "Monstera",
    species: "Monstera deliciosa",
    wateringIntervalDays: 7,
    lastWatered: new Date("2024-01-01T00:00:00.000Z"),
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

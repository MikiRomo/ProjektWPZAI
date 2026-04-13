import { HEALTH_THRESHOLDS } from "../constants";
import type { HealthStatus, Plant } from "../types";

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

/**
 * Zwraca datę kolejnego podlewania na podstawie ostatniego podlania i interwału.
 * @param plant Roślina, dla której wyliczamy kolejny termin.
 * @returns Data kolejnego podlewania.
 * @example
 * const next = getNextWateringDate(plant);
 */
export function getNextWateringDate(plant: Plant): Date {
  return new Date(plant.lastWatered.getTime() + plant.wateringIntervalDays * MILLISECONDS_IN_DAY);
}

/**
 * Oblicza liczbę dni między dwiema datami z uwzględnieniem części dziesiętnych.
 * @param from Data początkowa.
 * @param to Data końcowa.
 * @returns Liczba dni między datami.
 * @example
 * const days = getDaysDiff(new Date("2024-01-01"), new Date("2024-01-03"));
 */
export function getDaysDiff(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / MILLISECONDS_IN_DAY;
}

/**
 * Oblicza wskaźnik zdrowia rośliny na podstawie przeterminowania podlewania.
 * Score 100 = podlana dzisiaj lub przed terminem.
 * Score 0 = zaległa o więcej niż 2x interwał podlewania.
 *
 * @param plant Obiekt rośliny z lastWatered i wateringIntervalDays.
 * @param now Aktualna data referencyjna.
 * @returns Liczba całkowita 0-100.
 * @example
 * const score = calculateHealthScore(plant, new Date("2024-01-15"));
 */
export function calculateHealthScore(plant: Plant, now: Date = new Date()): number {
  const daysSinceWatering = getDaysDiff(plant.lastWatered, now);

  if (daysSinceWatering <= plant.wateringIntervalDays) {
    return 100;
  }

  const maxDays = plant.wateringIntervalDays * 2;
  if (daysSinceWatering >= maxDays) {
    return 0;
  }

  const delayRatio = (daysSinceWatering - plant.wateringIntervalDays) / plant.wateringIntervalDays;
  return Math.max(0, Math.min(100, Math.round(100 - delayRatio * 100)));
}

/**
 * Wyznacza status zdrowia rośliny na podstawie score.
 * @param score Wynik zdrowia 0-100.
 * @returns Nazwa statusu.
 * @example
 * const status = getHealthStatus(73);
 */
export function getHealthStatus(score: number): HealthStatus {
  if (score <= HEALTH_THRESHOLDS.DANGER) {
    return "critical";
  }

  if (score <= HEALTH_THRESHOLDS.WARNING) {
    return "warning";
  }

  return "healthy";
}

/**
 * Zwraca listę roślin, których termin podlewania wypada do wskazanej daty.
 * @param plants Lista roślin.
 * @param now Data referencyjna.
 * @returns Rośliny do podlania.
 * @example
 * const duePlants = getPlantsDueForWatering(plants, new Date());
 */
export function getPlantsDueForWatering(plants: Plant[], now: Date): Plant[] {
  return plants.filter((plant) => getNextWateringDate(plant).getTime() <= now.getTime());
}

/**
 * Grupuje rośliny po dniu kolejnego podlania.
 * @param plants Lista roślin.
 * @returns Mapa dzień -> lista roślin.
 * @example
 * const grouped = groupPlantsByWateringDay(plants);
 */
export function groupPlantsByWateringDay(plants: Plant[]): Record<string, Plant[]> {
  return plants.reduce<Record<string, Plant[]>>((accumulator, plant) => {
    const nextWatering = getNextWateringDate(plant);
    const key = `${nextWatering.getFullYear()}-${String(nextWatering.getMonth() + 1).padStart(2, "0")}-${String(nextWatering.getDate()).padStart(2, "0")}`;
    const existing = accumulator[key] ?? [];
    accumulator[key] = [...existing, plant];
    return accumulator;
  }, {});
}

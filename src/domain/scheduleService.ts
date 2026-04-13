import type { CareAction, Plant, WateringSchedule } from "./types";

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

/**
 * Dodaje wskazaną liczbę dni do podanej daty i zwraca nowy obiekt Date.
 * @param date Data bazowa.
 * @param days Liczba dni do dodania.
 * @returns Nowa data po dodaniu dni.
 * @example
 * const result = addDays(new Date("2026-04-01T00:00:00.000Z"), 3);
 * // 2026-04-04T00:00:00.000Z
 */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MILLISECONDS_IN_DAY);
}

/**
 * Wylicza najbliższy termin podlewania dla rośliny.
 * @param plant Dane rośliny z częstotliwością podlewania.
 * @param lastWateredAt Data ostatniego podlania; jeśli null, przyjmujemy "teraz".
 * @returns Data kolejnego podlewania.
 * @example
 * const next = calculateNextWateringDate(plant, "2026-04-10T10:00:00.000Z");
 */
export function calculateNextWateringDate(
  plant: Plant,
  lastWateredAt: string | null,
): Date {
  const baseDate = lastWateredAt ? new Date(lastWateredAt) : new Date();
  return addDays(baseDate, plant.wateringFrequencyDays);
}

/**
 * Buduje harmonogram podlewania dla wskazanej rośliny.
 * @param plant Dane rośliny.
 * @param lastWateredAt Data ostatniego podlania.
 * @param now Aktualny czas referencyjny używany do oceny zaległości.
 * @returns Harmonogram dla rośliny.
 * @example
 * const schedule = createWateringSchedule(plant, "2026-04-01T10:00:00.000Z");
 */
export function createWateringSchedule(
  plant: Plant,
  lastWateredAt: string | null,
  now: Date = new Date(),
): WateringSchedule {
  const nextWateringDate = calculateNextWateringDate(plant, lastWateredAt);

  return {
    plantId: plant.id,
    lastWateredAt,
    nextWateringAt: nextWateringDate.toISOString(),
    isOverdue: nextWateringDate.getTime() < now.getTime(),
  };
}

/**
 * Tworzy wpis historii opisujący wykonane podlanie rośliny.
 * @param plantId Identyfikator rośliny.
 * @param performedAt Znacznik czasu wykonania czynności.
 * @returns Zdarzenie typu WATERING.
 * @example
 * const action = createWateringAction("plant-1", "2026-04-13T08:00:00.000Z");
 */
export function createWateringAction(
  plantId: string,
  performedAt: string,
): CareAction {
  return {
    id: `${plantId}-${performedAt}`,
    plantId,
    type: "WATERING",
    performedAt,
  };
}

/**
 * Zwraca harmonogramy roślin, które powinny być podlane do wskazanego czasu.
 * @param schedules Lista harmonogramów.
 * @param now Aktualny czas referencyjny.
 * @returns Harmonogramy wymagające podlania teraz lub wcześniej.
 * @example
 * const due = getPlantsDueForWatering([schedule], new Date("2026-04-20T10:00:00.000Z"));
 */
export function getPlantsDueForWatering(
  schedules: WateringSchedule[],
  now: Date = new Date(),
): WateringSchedule[] {
  return schedules.filter((schedule) => {
    return new Date(schedule.nextWateringAt).getTime() <= now.getTime();
  });
}

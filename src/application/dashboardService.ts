import { createWateringSchedule } from "../domain/scheduleService";
import type { Plant, WateringSchedule } from "../domain/types";

/**
 * Reprezentuje podział harmonogramów na sekcje dashboardu.
 * @example
 * const groups: DashboardGroups = {
 *   overdue: [],
 *   dueToday: [],
 *   upcoming: [],
 * };
 */
export interface DashboardGroups {
  overdue: WateringSchedule[];
  dueToday: WateringSchedule[];
  upcoming: WateringSchedule[];
}

/**
 * Zwraca datę początku dnia dla podanego czasu.
 * @param date Dowolny znacznik czasu.
 * @returns Data ustawiona na 00:00:00.000.
 * @example
 * const dayStart = getStartOfDay(new Date("2026-04-13T12:00:00.000Z"));
 */
export function getStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Buduje harmonogramy na podstawie listy roślin i dat ostatniego podlania.
 * @param plants Rośliny do przeliczenia.
 * @param lastWateredByPlantId Mapa ostatnich podlań po identyfikatorze rośliny.
 * @param now Czas referencyjny do oceny zaległości.
 * @returns Lista harmonogramów w tej samej kolejności co rośliny.
 * @example
 * const schedules = buildSchedules(plants, { "plant-1": "2026-04-10T10:00:00.000Z" });
 */
export function buildSchedules(
  plants: Plant[],
  lastWateredByPlantId: Record<string, string | null>,
  now: Date = new Date(),
): WateringSchedule[] {
  return plants.map((plant) => {
    const lastWateredAt = lastWateredByPlantId[plant.id] ?? null;
    return createWateringSchedule(plant, lastWateredAt, now);
  });
}

/**
 * Dzieli harmonogramy na sekcje: zaległe, na dziś i nadchodzące.
 * @param schedules Lista harmonogramów.
 * @param now Czas referencyjny dla podziału.
 * @returns Obiekt z trzema sekcjami dla dashboardu.
 * @example
 * const groups = groupSchedulesForDashboard(schedules, new Date("2026-04-13T10:00:00.000Z"));
 */
export function groupSchedulesForDashboard(
  schedules: WateringSchedule[],
  now: Date = new Date(),
): DashboardGroups {
  const startOfToday = getStartOfDay(now).getTime();
  const endOfToday = startOfToday + 24 * 60 * 60 * 1000;

  return schedules.reduce<DashboardGroups>(
    (groups, schedule) => {
      const nextTime = new Date(schedule.nextWateringAt).getTime();

      if (nextTime < startOfToday) {
        groups.overdue.push(schedule);
      } else if (nextTime < endOfToday) {
        groups.dueToday.push(schedule);
      } else {
        groups.upcoming.push(schedule);
      }

      return groups;
    },
    { overdue: [], dueToday: [], upcoming: [] },
  );
}

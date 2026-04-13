import type { WateringSchedule } from "../domain/types";

/**
 * Reprezentuje pojedynczy dzień w siatce kalendarza miesięcznego.
 * @example
 * const day: CalendarDayCell = { date: new Date(), isCurrentMonth: true, dueCount: 2 };
 */
export interface CalendarDayCell {
  date: Date;
  isCurrentMonth: boolean;
  dueCount: number;
}

/**
 * Formatuje liczbę do postaci dwucyfrowej.
 * @param value Liczba do sformatowania.
 * @returns Wartość tekstowa z zerem wiodącym.
 * @example
 * const result = twoDigit(4); // "04"
 */
function twoDigit(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/**
 * Buduje klucz dnia w formacie `YYYY-MM-DD`.
 * @param date Data wejściowa.
 * @returns Klucz tekstowy dnia.
 * @example
 * const key = getDayKey(new Date("2026-04-13T10:00:00.000Z"));
 */
export function getDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = twoDigit(date.getMonth() + 1);
  const day = twoDigit(date.getDate());
  return `${year}-${month}-${day}`;
}

/**
 * Grupuje harmonogramy po dniach terminu następnego podlania.
 * @param schedules Lista harmonogramów.
 * @returns Mapa dzień -> liczba zadań podlewania.
 * @example
 * const dueByDay = groupSchedulesByDay(schedules);
 */
export function groupSchedulesByDay(schedules: WateringSchedule[]): Record<string, number> {
  return schedules.reduce<Record<string, number>>((accumulator, schedule) => {
    const key = getDayKey(new Date(schedule.nextWateringAt));
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
}

/**
 * Buduje 6-tygodniową siatkę kalendarza dla wybranego miesiąca.
 * @param currentMonth Dowolna data wewnątrz renderowanego miesiąca.
 * @param schedules Harmonogramy używane do oznaczeń liczby zadań w danym dniu.
 * @returns Lista 42 komórek kalendarza.
 * @example
 * const cells = buildMonthCalendar(new Date("2026-04-01T00:00:00.000Z"), schedules);
 */
export function buildMonthCalendar(
  currentMonth: Date,
  schedules: WateringSchedule[],
): CalendarDayCell[] {
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - startWeekday);

  const dueByDay = groupSchedulesByDay(schedules);
  const cells: CalendarDayCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const key = getDayKey(date);

    cells.push({
      date,
      isCurrentMonth: date.getMonth() === currentMonth.getMonth(),
      dueCount: dueByDay[key] ?? 0,
    });
  }

  return cells;
}

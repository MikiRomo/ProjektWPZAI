/**
 * Reprezentuje pojedynczą roślinę zarządzaną przez aplikację.
 * @example
 * const plant: Plant = {
 *   id: "plant-1",
 *   name: "Monstera",
 *   species: "Monstera deliciosa",
 *   wateringFrequencyDays: 7,
 *   createdAt: "2026-04-13T10:00:00.000Z",
 *   updatedAt: "2026-04-13T10:00:00.000Z",
 * };
 */
export interface Plant {
  id: string;
  name: string;
  species: string;
  wateringFrequencyDays: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Opisuje stan harmonogramu podlewania dla jednej rośliny.
 * @example
 * const schedule: WateringSchedule = {
 *   plantId: "plant-1",
 *   lastWateredAt: "2026-04-13T10:00:00.000Z",
 *   nextWateringAt: "2026-04-20T10:00:00.000Z",
 *   isOverdue: false,
 * };
 */
export interface WateringSchedule {
  plantId: string;
  lastWateredAt: string | null;
  nextWateringAt: string;
  isOverdue: boolean;
}

/**
 * Rejestruje pojedynczą akcję pielęgnacyjną wykonaną przez użytkownika.
 * @example
 * const action: CareAction = {
 *   id: "action-1",
 *   plantId: "plant-1",
 *   type: "WATERING",
 *   performedAt: "2026-04-13T10:00:00.000Z",
 * };
 */
export interface CareAction {
  id: string;
  plantId: string;
  type: "WATERING" | "FERTILIZING" | "PRUNING" | "OTHER";
  performedAt: string;
  note?: string;
}

/**
 * Przechowuje pełny stan aplikacji po stronie klienta.
 * @example
 * const state: AppState = {
 *   plants: [],
 *   schedules: [],
 *   careActions: [],
 *   version: 1,
 * };
 */
export interface AppState {
  plants: Plant[];
  schedules: WateringSchedule[];
  careActions: CareAction[];
  version: number;
}

import { buildSchedules } from "./dashboardService";
import { createWateringAction } from "../domain/scheduleService";
import type { AppState, CareAction, Plant } from "../domain/types";

/**
 * Klucz localStorage używany do trwałego zapisu stanu aplikacji.
 */
export const APP_STATE_STORAGE_KEY = "plantagotchi.appState.v1";

/**
 * Minimalny kontrakt magazynu danych zgodny z localStorage.
 * @example
 * const memoryStorage: StorageLike = {
 *   getItem: () => null,
 *   setItem: () => undefined,
 * };
 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const DEFAULT_VERSION = 1;

/**
 * Tworzy przykładowe rośliny startowe dla pierwszego uruchomienia aplikacji.
 * @returns Lista domyślnych roślin.
 * @example
 * const defaults = createDefaultPlants();
 */
export function createDefaultPlants(): Plant[] {
  return [
    {
      id: "plant-1",
      name: "Monstera",
      species: "Monstera deliciosa",
      wateringFrequencyDays: 7,
      createdAt: "2026-04-01T09:00:00.000Z",
      updatedAt: "2026-04-01T09:00:00.000Z",
    },
    {
      id: "plant-2",
      name: "Fikus",
      species: "Ficus elastica",
      wateringFrequencyDays: 4,
      createdAt: "2026-04-02T09:00:00.000Z",
      updatedAt: "2026-04-02T09:00:00.000Z",
    },
  ];
}

/**
 * Tworzy domyślne akcje historii dla stanu początkowego.
 * @returns Lista początkowych akcji pielęgnacyjnych.
 * @example
 * const actions = createDefaultCareActions();
 */
export function createDefaultCareActions(): CareAction[] {
  return [
    createWateringAction("plant-1", "2026-04-06T09:00:00.000Z"),
    createWateringAction("plant-2", "2026-04-12T09:00:00.000Z"),
  ];
}

/**
 * Buduje mapę ostatnich podlań dla każdej rośliny na podstawie historii akcji.
 * @param careActions Lista akcji pielęgnacyjnych.
 * @returns Mapa identyfikator rośliny -> data ostatniego podlania.
 * @example
 * const latest = getLatestWateringByPlantId(careActions);
 */
export function getLatestWateringByPlantId(
  careActions: CareAction[],
): Record<string, string | null> {
  const latestByPlantId: Record<string, string | null> = {};

  for (const action of careActions) {
    if (action.type !== "WATERING") {
      continue;
    }

    const currentLatest = latestByPlantId[action.plantId];
    if (!currentLatest || new Date(action.performedAt).getTime() > new Date(currentLatest).getTime()) {
      latestByPlantId[action.plantId] = action.performedAt;
    }
  }

  return latestByPlantId;
}

/**
 * Buduje pełny stan aplikacji i wylicza harmonogramy z aktualnej historii.
 * @param plants Lista roślin.
 * @param careActions Historia działań pielęgnacyjnych.
 * @returns Spójny stan aplikacji gotowy do zapisania.
 * @example
 * const state = createAppState(plants, careActions);
 */
export function createAppState(plants: Plant[], careActions: CareAction[]): AppState {
  const latestWateringByPlantId = getLatestWateringByPlantId(careActions);
  const schedules = buildSchedules(plants, latestWateringByPlantId, new Date());

  return {
    plants,
    schedules,
    careActions,
    version: DEFAULT_VERSION,
  };
}

/**
 * Tworzy stan domyślny dla pierwszego uruchomienia aplikacji.
 * @returns Domyślny stan Plantagotchi.
 * @example
 * const initial = createInitialAppState();
 */
export function createInitialAppState(): AppState {
  return createAppState(createDefaultPlants(), createDefaultCareActions());
}

/**
 * Wczytuje stan aplikacji z magazynu lub zwraca stan startowy.
 * @param storage Magazyn kompatybilny z localStorage.
 * @param storageKey Klucz pod którym zapisany jest stan aplikacji.
 * @returns Odczytany albo domyślny stan aplikacji.
 * @example
 * const state = loadAppState(window.localStorage, APP_STATE_STORAGE_KEY);
 */
export function loadAppState(storage: StorageLike, storageKey: string): AppState {
  const rawValue = storage.getItem(storageKey);

  if (!rawValue) {
    return createInitialAppState();
  }

  try {
    const parsed = JSON.parse(rawValue) as AppState;
    return createAppState(parsed.plants ?? [], parsed.careActions ?? []);
  } catch {
    return createInitialAppState();
  }
}

/**
 * Zapisuje wskazany stan aplikacji do magazynu.
 * @param storage Magazyn kompatybilny z localStorage.
 * @param storageKey Klucz stanu aplikacji.
 * @param state Stan aplikacji do utrwalenia.
 * @returns Funkcja nie zwraca wartości.
 * @example
 * saveAppState(window.localStorage, APP_STATE_STORAGE_KEY, appState);
 */
export function saveAppState(storage: StorageLike, storageKey: string, state: AppState): void {
  storage.setItem(storageKey, JSON.stringify(state));
}

/**
 * Dodaje nową roślinę i odświeża harmonogramy.
 * @param state Aktualny stan aplikacji.
 * @param plant Roślina do dodania.
 * @returns Nowy stan aplikacji po dodaniu rośliny.
 * @example
 * const nextState = addPlant(state, plant);
 */
export function addPlant(state: AppState, plant: Plant): AppState {
  return createAppState([...state.plants, plant], state.careActions);
}

/**
 * Dodaje nową roślinę wraz z opcjonalną akcją pierwszego podlania.
 * @param state Aktualny stan aplikacji.
 * @param plant Roślina do dodania.
 * @param firstWateringAt Opcjonalny czas ostatniego podlania z formularza.
 * @returns Nowy stan aplikacji po dodaniu rośliny i ewentualnej akcji.
 * @example
 * const nextState = addPlantWithOptionalWatering(state, plant, "2026-04-13T10:00:00.000Z");
 */
export function addPlantWithOptionalWatering(
  state: AppState,
  plant: Plant,
  firstWateringAt?: string,
): AppState {
  const nextPlants = [...state.plants, plant];

  if (!firstWateringAt) {
    return createAppState(nextPlants, state.careActions);
  }

  const nextActions = [...state.careActions, createWateringAction(plant.id, firstWateringAt)];
  return createAppState(nextPlants, nextActions);
}

/**
 * Rejestruje podlanie rośliny i aktualizuje harmonogram.
 * @param state Aktualny stan aplikacji.
 * @param plantId Identyfikator rośliny, którą właśnie podlano.
 * @param performedAt Znacznik czasu wykonania podlania.
 * @returns Nowy stan aplikacji po zapisaniu podlania.
 * @example
 * const nextState = markPlantWatered(state, "plant-1", new Date().toISOString());
 */
export function markPlantWatered(
  state: AppState,
  plantId: string,
  performedAt: string,
  plannedNextWateringAt?: string,
): AppState {
  const resolvedPerformedAt = resolvePerformedAt(performedAt, plannedNextWateringAt);
  const nextActions = [...state.careActions, createWateringAction(plantId, resolvedPerformedAt)];
  return createAppState(state.plants, nextActions);
}

/**
 * Usuwa roślinę wraz z powiązaną historią działań pielęgnacyjnych.
 * @param state Aktualny stan aplikacji.
 * @param plantId Identyfikator rośliny do usunięcia.
 * @returns Nowy stan aplikacji po usunięciu rośliny i jej historii.
 * @example
 * const nextState = removePlant(state, "plant-1");
 */
export function removePlant(state: AppState, plantId: string): AppState {
  const nextPlants = state.plants.filter((plant) => plant.id !== plantId);
  const nextActions = state.careActions.filter((action) => action.plantId !== plantId);
  return createAppState(nextPlants, nextActions);
}

/**
 * Aktualizuje dane rośliny i odświeża harmonogram całej aplikacji.
 * @param state Aktualny stan aplikacji.
 * @param updatedPlant Roślina po edycji.
 * @returns Nowy stan aplikacji po zapisaniu zmian.
 * @example
 * const nextState = updatePlant(state, { ...plant, wateringFrequencyDays: 3 });
 */
export function updatePlant(state: AppState, updatedPlant: Plant): AppState {
  const nextPlants = state.plants.map((plant) => {
    if (plant.id !== updatedPlant.id) {
      return plant;
    }

    return {
      ...updatedPlant,
      updatedAt: new Date().toISOString(),
    };
  });

  return createAppState(nextPlants, state.careActions);
}

/**
 * Wyznacza efektywny czas podlania tak, aby uniknąć dryfu minut dla przyszłych terminów.
 * @param performedAt Czas kliknięcia akcji przez użytkownika.
 * @param plannedNextWateringAt Planowany najbliższy termin podlewania.
 * @returns Czas użyty do aktualizacji harmonogramu.
 * @example
 * const at = resolvePerformedAt("2026-04-13T10:01:00.000Z", "2026-04-15T09:00:00.000Z");
 */
export function resolvePerformedAt(
  performedAt: string,
  plannedNextWateringAt?: string,
): string {
  if (!plannedNextWateringAt) {
    return performedAt;
  }

  const performedTime = new Date(performedAt).getTime();
  const plannedTime = new Date(plannedNextWateringAt).getTime();

  if (plannedTime > performedTime) {
    return plannedNextWateringAt;
  }

  return performedAt;
}

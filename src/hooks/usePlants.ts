import { useEffect, useState } from "react";

import { STORAGE_KEYS } from "../constants";
import type { CareAction, Plant, PlantFormData } from "../types";

interface SerializedPlant extends Omit<Plant, "createdAt" | "lastWatered"> {
  createdAt: string;
  lastWatered: string;
}

interface SerializedCareAction extends Omit<CareAction, "performedAt"> {
  performedAt: string;
}

/**
 * Konwertuje roślinę do formatu serializowalnego w localStorage.
 * @param plant Roślina do serializacji.
 * @returns Zserializowana roślina z datami ISO.
 * @example
 * const serialized = serializePlant(plant);
 */
export function serializePlant(plant: Plant): SerializedPlant {
  return {
    ...plant,
    createdAt: plant.createdAt.toISOString(),
    lastWatered: plant.lastWatered.toISOString(),
  };
}

/**
 * Konwertuje dane rośliny z localStorage do modelu domenowego.
 * @param input Zserializowana roślina.
 * @returns Roślina z polami dat typu Date.
 * @example
 * const plant = deserializePlant(rawPlant);
 */
export function deserializePlant(input: SerializedPlant): Plant {
  return {
    ...input,
    createdAt: new Date(input.createdAt),
    lastWatered: new Date(input.lastWatered),
  };
}

/**
 * Konwertuje akcję pielęgnacyjną do formatu serializowalnego.
 * @param action Akcja pielęgnacyjna.
 * @returns Zserializowana akcja.
 * @example
 * const serialized = serializeCareAction(action);
 */
export function serializeCareAction(action: CareAction): SerializedCareAction {
  return {
    ...action,
    performedAt: action.performedAt.toISOString(),
  };
}

/**
 * Konwertuje zserializowaną akcję pielęgnacyjną do modelu domenowego.
 * @param input Zserializowana akcja.
 * @returns Akcja z polem daty typu Date.
 * @example
 * const action = deserializeCareAction(rawAction);
 */
export function deserializeCareAction(input: SerializedCareAction): CareAction {
  return {
    ...input,
    performedAt: new Date(input.performedAt),
  };
}

/**
 * Tworzy nowy obiekt rośliny na podstawie danych formularza.
 * @param data Dane formularza.
 * @param now Bieżąca data wstrzykiwana do testów.
 * @returns Nowa roślina gotowa do zapisu.
 * @example
 * const plant = createPlantFromForm(data, new Date("2026-04-13T10:00:00.000Z"));
 */
export function createPlantFromForm(data: PlantFormData, now: Date): Plant {
  return {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
  };
}

/**
 * Hook zarządzający listą roślin z persystencją w localStorage.
 * Serializuje daty jako ISO string, deserializuje z powrotem do Date przy odczycie.
 *
 * @returns Zestaw operacji CRUD dla roślin wraz ze stanem ładowania.
 * @example
 * const { plants, addPlant, markWatered } = usePlants();
 */
export function usePlants(): {
  plants: Plant[];
  careActions: CareAction[];
  addPlant: (data: PlantFormData) => void;
  removePlant: (id: string) => void;
  updatePlant: (id: string, data: Partial<Plant>) => void;
  markWatered: (id: string, date?: Date) => void;
  isLoading: boolean;
} {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [careActions, setCareActions] = useState<CareAction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const plantsRaw = window.localStorage.getItem(STORAGE_KEYS.PLANTS);
      const careActionsRaw = window.localStorage.getItem(STORAGE_KEYS.CARE_ACTIONS);

      if (plantsRaw) {
        const parsedPlants = JSON.parse(plantsRaw) as SerializedPlant[];
        setPlants(parsedPlants.map(deserializePlant));
      }

      if (careActionsRaw) {
        const parsedActions = JSON.parse(careActionsRaw) as SerializedCareAction[];
        setCareActions(parsedActions.map(deserializeCareAction));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const serializedPlants = plants.map(serializePlant);
    window.localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(serializedPlants));
  }, [plants, isLoading]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const serializedActions = careActions.map(serializeCareAction);
    window.localStorage.setItem(STORAGE_KEYS.CARE_ACTIONS, JSON.stringify(serializedActions));
  }, [careActions, isLoading]);

  const addPlant = (data: PlantFormData): void => {
    const now = new Date();
    const nextPlant = createPlantFromForm(data, now);
    setPlants((currentPlants) => [...currentPlants, nextPlant]);
    setCareActions((currentActions) => [
      ...currentActions,
      {
        id: crypto.randomUUID(),
        plantId: nextPlant.id,
        type: "WATERING",
        performedAt: data.lastWatered,
      },
    ]);
  };

  const removePlant = (id: string): void => {
    setPlants((currentPlants) => currentPlants.filter((plant) => plant.id !== id));
    setCareActions((currentActions) => currentActions.filter((action) => action.plantId !== id));
  };

  const updatePlant = (id: string, data: Partial<Plant>): void => {
    setPlants((currentPlants) => {
      return currentPlants.map((plant) => {
        if (plant.id !== id) {
          return plant;
        }

        return { ...plant, ...data, id: plant.id };
      });
    });
  };

  const markWatered = (id: string, date: Date = new Date()): void => {
    setPlants((currentPlants) => {
      return currentPlants.map((plant) => {
        if (plant.id !== id) {
          return plant;
        }

        return {
          ...plant,
          lastWatered: date,
        };
      });
    });

    setCareActions((currentActions) => [
      ...currentActions,
      {
        id: crypto.randomUUID(),
        plantId: id,
        type: "WATERING",
        performedAt: date,
      },
    ]);
  };

  return { plants, careActions, addPlant, removePlant, updatePlant, markWatered, isLoading };
}

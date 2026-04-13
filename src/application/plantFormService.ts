import { createWateringAction } from "../domain/scheduleService";
import { z } from "zod";
import type { CareAction, Plant } from "../domain/types";

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 50;
const MIN_SPECIES_LENGTH = 2;
const MAX_SPECIES_LENGTH = 80;
const MIN_WATERING_INTERVAL_DAYS = 1;
const MAX_WATERING_INTERVAL_DAYS = 365;

/**
 * Reprezentuje surowe dane formularza dodawania rośliny.
 * @example
 * const draft: PlantDraft = { name: "Monstera", species: "Monstera deliciosa", wateringFrequency: "7" };
 */
export interface PlantDraft {
  name: string;
  species: string;
  wateringFrequency: string;
  lastWateredAtLocal?: string;
}

/**
 * Reprezentuje poprawnie zwalidowane dane formularza rośliny.
 * @example
 * const data: PlantFormData = {
 *   name: "Monstera",
 *   species: "Monstera deliciosa",
 *   wateringIntervalDays: 7,
 *   lastWatered: new Date("2026-04-13T10:00:00.000Z"),
 * };
 */
export interface PlantFormData {
  name: string;
  species: string;
  wateringIntervalDays: number;
  lastWatered: Date;
}

/**
 * Reprezentuje pojedynczy błąd walidacji formularza.
 * @example
 * const error: PlantFormValidationError = { field: "name", message: "Nazwa jest wymagana." };
 */
export interface PlantFormValidationError {
  field: keyof PlantFormData;
  message: string;
}

/**
 * Zawiera wynik walidacji formularza rośliny.
 * @example
 * const result: PlantDraftValidationResult = { isValid: true, errors: [] };
 */
export interface PlantDraftValidationResult {
  isValid: boolean;
  data?: PlantFormData;
  errors: PlantFormValidationError[];
}

const plantFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(MIN_NAME_LENGTH, `Nazwa musi mieć minimum ${MIN_NAME_LENGTH} znaki.`)
    .max(MAX_NAME_LENGTH, `Nazwa może mieć maksymalnie ${MAX_NAME_LENGTH} znaków.`),
  species: z
    .string()
    .trim()
    .min(MIN_SPECIES_LENGTH, `Gatunek musi mieć minimum ${MIN_SPECIES_LENGTH} znaki.`)
    .max(MAX_SPECIES_LENGTH, `Gatunek może mieć maksymalnie ${MAX_SPECIES_LENGTH} znaków.`),
  wateringIntervalDays: z
    .number()
    .int("Interwał podlewania musi być liczbą całkowitą.")
    .min(
      MIN_WATERING_INTERVAL_DAYS,
      `Interwał podlewania musi być w zakresie ${MIN_WATERING_INTERVAL_DAYS}-${MAX_WATERING_INTERVAL_DAYS}.`,
    )
    .max(
      MAX_WATERING_INTERVAL_DAYS,
      `Interwał podlewania musi być w zakresie ${MIN_WATERING_INTERVAL_DAYS}-${MAX_WATERING_INTERVAL_DAYS}.`,
    ),
  lastWatered: z.date(),
});

/**
 * Waliduje dane formularza rośliny.
 * @param draft Surowe dane formularza.
 * @returns Informacja czy dane są poprawne oraz ewentualny komunikat błędu.
 * @example
 * const result = validatePlantDraft(draft);
 */
export function validatePlantDraft(draft: PlantDraft): PlantDraftValidationResult {
  const parsedLastWatered = draft.lastWateredAtLocal
    ? new Date(draft.lastWateredAtLocal)
    : new Date("");
  const parsedInput = {
    name: draft.name,
    species: draft.species,
    wateringIntervalDays: Number(draft.wateringFrequency),
    lastWatered: parsedLastWatered,
  };
  const result = plantFormSchema.safeParse(parsedInput);
  const now = new Date();
  const errors: PlantFormValidationError[] = [];

  if (!result.success) {
    for (const issue of result.error.issues) {
      const fieldName = issue.path[0];
      if (
        fieldName === "name" ||
        fieldName === "species" ||
        fieldName === "wateringIntervalDays" ||
        fieldName === "lastWatered"
      ) {
        errors.push({ field: fieldName, message: issue.message });
      }
    }
  }

  if (Number.isNaN(parsedLastWatered.getTime())) {
    errors.push({
      field: "lastWatered",
      message: "Data ostatniego podlania jest wymagana.",
    });
  } else if (parsedLastWatered.getTime() > now.getTime()) {
    errors.push({
      field: "lastWatered",
      message: "Data ostatniego podlania nie może być z przyszłości.",
    });
  }

  const deduplicatedErrors = errors.filter((error, index, allErrors) => {
    return allErrors.findIndex((candidate) => candidate.field === error.field) === index;
  });

  if (deduplicatedErrors.length > 0 || !result.success) {
    return {
      isValid: false,
      errors: deduplicatedErrors,
    };
  }

  return { isValid: true, data: result.data, errors: [] };
}

/**
 * Konwertuje wartość `datetime-local` do formatu ISO.
 * @param localDateTime Wartość z pola typu `datetime-local`.
 * @returns Data w formacie ISO lub undefined, gdy wartość jest pusta.
 * @example
 * const iso = toIsoFromDateTimeLocal("2026-04-13T10:30");
 */
export function toIsoFromDateTimeLocal(localDateTime?: string): string | undefined {
  if (!localDateTime?.trim()) {
    return undefined;
  }

  return new Date(localDateTime).toISOString();
}

/**
 * Tworzy komplet danych domenowych potrzebnych do dodania rośliny.
 * @param draft Surowe dane formularza.
 * @returns Obiekt z rośliną i opcjonalną akcją pierwszego podlania.
 * @example
 * const payload = buildPlantCreationPayload(draft);
 */
export function buildPlantCreationPayload(draft: PlantDraft): {
  plant: Plant;
  firstWateringAction?: CareAction;
} {
  const validation = validatePlantDraft(draft);
  if (!validation.isValid || !validation.data) {
    throw new Error("Attempted to build plant payload from invalid form data.");
  }

  const nowIso = new Date().toISOString();
  const plantId = `plant-${crypto.randomUUID()}`;
  const wateringFrequencyDays = validation.data.wateringIntervalDays;
  const lastWateredAtIso = validation.data.lastWatered.toISOString();

  return {
    plant: {
      id: plantId,
      name: validation.data.name,
      species: validation.data.species,
      wateringFrequencyDays,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    firstWateringAction: lastWateredAtIso
      ? createWateringAction(plantId, lastWateredAtIso)
      : undefined,
  };
}

import { z } from "zod";

import type { PlantFormData, ValidationResult } from "../types";

const plantFormSchema = z.object({
  name: z.string().trim().min(2).max(50),
  species: z.string().trim().min(2).max(80),
  wateringIntervalDays: z.number().int().min(1).max(365),
  lastWatered: z.date(),
  photoUrl: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Waliduje dane formularza rośliny według schemy Zod.
 * @param data Dane wejściowe formularza.
 * @param now Aktualna data referencyjna.
 * @returns Struktura walidacji z listą błędów pól.
 * @example
 * const result = validatePlantForm(formData, new Date());
 */
export function validatePlantForm(
  data: PlantFormData,
  now: Date = new Date(),
): ValidationResult<PlantFormData> {
  const parseResult = plantFormSchema.safeParse(data);

  const errors: ValidationResult<PlantFormData>["errors"] = [];
  if (!parseResult.success) {
    for (const issue of parseResult.error.issues) {
      const field = issue.path[0];
      if (
        field === "name" ||
        field === "species" ||
        field === "wateringIntervalDays" ||
        field === "lastWatered" ||
        field === "photoUrl" ||
        field === "notes"
      ) {
        errors.push({ field, message: issue.message });
      }
    }
  }

  if (data.lastWatered.getTime() > now.getTime()) {
    errors.push({
      field: "lastWatered",
      message: "Data ostatniego podlania nie moze byc z przyszlosci.",
    });
  }

  if (errors.length > 0 || !parseResult.success) {
    return { success: false, errors };
  }

  return { success: true, data: parseResult.data, errors: [] };
}

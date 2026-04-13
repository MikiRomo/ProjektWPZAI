import { describe, expect, it } from "vitest";

import {
  buildPlantCreationPayload,
  toIsoFromDateTimeLocal,
  validatePlantDraft,
} from "./plantFormService";

describe("plantFormService", () => {
  it("validatePlantDraft should reject empty name", () => {
    const result = validatePlantDraft({
      name: " ",
      species: "Monstera deliciosa",
      wateringFrequency: "7",
    });
    expect(result.isValid).toBe(false);
  });

  it("validatePlantDraft should reject non-positive frequency", () => {
    const result = validatePlantDraft({
      name: "Monstera",
      species: "Monstera deliciosa",
      wateringFrequency: "0",
    });
    expect(result.isValid).toBe(false);
  });

  it("toIsoFromDateTimeLocal should return undefined for empty value", () => {
    expect(toIsoFromDateTimeLocal("")).toBeUndefined();
  });

  it("buildPlantCreationPayload should create first watering action when date exists", () => {
    const payload = buildPlantCreationPayload({
      name: "Monstera",
      species: "Monstera deliciosa",
      wateringFrequency: "7",
      lastWateredAtLocal: "2026-04-13T10:30",
    });

    expect(payload.plant.name).toBe("Monstera");
    expect(payload.firstWateringAction?.type).toBe("WATERING");
  });
});

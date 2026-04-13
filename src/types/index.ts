export interface Plant {
  id: string;
  name: string;
  species: string;
  wateringIntervalDays: number;
  lastWatered: Date;
  photoUrl?: string;
  notes?: string;
  createdAt: Date;
}

export interface CareAction {
  id: string;
  plantId: string;
  type: "WATERING" | "FERTILIZING" | "REPOTTING";
  performedAt: Date;
  notes?: string;
}

export type PlantFormData = Omit<Plant, "id" | "createdAt">;

export type HealthStatus = "healthy" | "warning" | "critical";

export interface AppState {
  plants: Plant[];
  careActions: CareAction[];
  activeTab: "plants" | "calendar" | "history";
  theme: "light" | "dark" | "system";
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: { field: keyof T; message: string }[];
}

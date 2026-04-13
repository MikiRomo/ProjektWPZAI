/**
 * Klucze localStorage używane przez aplikację Plantagotchi.
 * @example
 * const key = STORAGE_KEYS.PLANTS;
 */
export const STORAGE_KEYS = {
  PLANTS: "plantagotchi_plants",
  CARE_ACTIONS: "plantagotchi_care_actions",
  THEME: "plantagotchi_theme",
  NOTIFICATIONS_ENABLED: "plantagotchi_notifications_enabled",
} as const;

/**
 * Progi używane do klasyfikacji zdrowia roślin.
 * @example
 * const warning = HEALTH_THRESHOLDS.WARNING;
 */
export const HEALTH_THRESHOLDS = {
  DANGER: 40,
  WARNING: 70,
} as const;

/**
 * Stałe związane z harmonogramem i plikami.
 * @example
 * const maxSize = APP_LIMITS.MAX_PHOTO_BYTES;
 */
export const APP_LIMITS = {
  MAX_PHOTO_BYTES: 200 * 1024,
  DAILY_NOTIFICATION_HOUR: 9,
} as const;

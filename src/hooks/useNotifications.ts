import { useEffect, useMemo, useState } from "react";

import { APP_LIMITS, STORAGE_KEYS } from "../constants";
import { getPlantsDueForWatering } from "../utils/watering";
import type { Plant } from "../types";

/**
 * Oblicza opóźnienie do następnej godziny 9:00.
 * @param now Aktualna data referencyjna.
 * @returns Liczba milisekund do następnego powiadomienia.
 * @example
 * const delay = getDelayToNextNotification(new Date());
 */
export function getDelayToNextNotification(now: Date): number {
  const next = new Date(now);
  next.setHours(APP_LIMITS.DAILY_NOTIFICATION_HOUR, 0, 0, 0);

  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  return next.getTime() - now.getTime();
}

/**
 * Hook zarządzający banerem zgody i harmonogramem Web Notifications API.
 * @param plants Aktualna lista roślin.
 * @returns Flagi UI i akcja aktywująca powiadomienia.
 * @example
 * const { shouldShowBanner, enableNotifications } = useNotifications(plants);
 */
export function useNotifications(plants: Plant[]): {
  shouldShowBanner: boolean;
  isDenied: boolean;
  enableNotifications: () => Promise<void>;
} {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    const stored = window.localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
    return stored === "true";
  });
  const [permission, setPermission] = useState<NotificationPermission>(() => Notification.permission);

  useEffect(() => {
    if (!isEnabled || permission !== "granted") {
      return;
    }

    const notify = () => {
      const duePlants = getPlantsDueForWatering(plants, new Date());
      if (duePlants.length === 0) {
        return;
      }

      const names = duePlants.map((plant) => plant.name).join(", ");
      void new Notification("Plantagotchi - czas na podlewanie", {
        body: `Do podlania: ${names}`,
      });
    };

    const scheduleNext = () => {
      const delay = getDelayToNextNotification(new Date());
      return window.setTimeout(() => {
        notify();
        scheduleNext();
      }, delay);
    };

    const timeoutId = scheduleNext();
    return () => window.clearTimeout(timeoutId);
  }, [isEnabled, permission, plants]);

  /**
   * Prosi użytkownika o zgodę na powiadomienia i utrwala wybór.
   * @returns Promise zakończony po obsłużeniu zgody.
   * @example
   * await enableNotifications();
   */
  const enableNotifications = async (): Promise<void> => {
    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);

    if (nextPermission === "granted") {
      setIsEnabled(true);
      window.localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, "true");
    } else {
      window.localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, "false");
    }
  };

  const shouldShowBanner = useMemo(() => {
    return permission === "default" && !isEnabled;
  }, [permission, isEnabled]);

  return {
    shouldShowBanner,
    isDenied: permission === "denied",
    enableNotifications,
  };
}

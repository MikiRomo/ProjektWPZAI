import { useEffect, useState } from "react";

import { STORAGE_KEYS } from "../constants";

/**
 * Hook zarządzający motywem aplikacji z persystencją i fallbackiem systemowym.
 * @returns Aktualny motyw i funkcja przełączająca.
 * @example
 * const { theme, setTheme } = useTheme();
 */
export function useTheme(): {
  theme: "light" | "dark" | "system";
  setTheme: (nextTheme: "light" | "dark" | "system") => void;
  resolvedTheme: "light" | "dark";
} {
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEYS.THEME);
    if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
      return storedTheme;
    }
    return "system";
  });

  const resolvedTheme: "light" | "dark" = (() => {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return theme === "system" ? (systemDark ? "dark" : "light") : theme;
  })();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    window.localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [resolvedTheme, theme]);

  return { theme, setTheme, resolvedTheme };
}

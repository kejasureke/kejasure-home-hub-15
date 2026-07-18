import { useState, useEffect, useCallback } from "react";
import { syncStatusBarWithTheme } from "@/lib/despia";

type Theme = "light" | "dark";

const STORAGE_KEY = "kejasure_theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      return stored === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
    // Status bar text color must be updated after the CSS transition completes
    // so iOS sees the final background color and accepts the change.
    window.setTimeout(() => syncStatusBarWithTheme(t), 320);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    syncStatusBarWithTheme(theme);
  }, [theme]);

  return { theme, resolvedTheme: theme, setTheme };
};

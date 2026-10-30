"use client";

import React from "react";
import { getMaterialTheme } from "@/lib/m3-theme";

const STORAGE_KEY_DARK_MODE = "foodlette_dark_mode";

/**
 * Manages Light / Dark theme mode (backed by the fixed Material Theme Builder JSON scheme),
 * wheel tick sound preference, and CSS custom property synchronization on document.documentElement.
 */
export function useM3Theme() {
  const [isDark, setIsDark] = React.useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY_DARK_MODE);
    if (saved === "true" || saved === "false") {
      setIsDark(saved === "true");
    } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      setIsDark(true);
    }
  }, []);

  const theme = React.useMemo(() => getMaterialTheme(isDark), [isDark]);

  React.useEffect(() => {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(theme.cssVars)) {
      root.style.setProperty(k, v);
    }
  }, [theme]);

  const toggleDark = React.useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_DARK_MODE, String(next));
      }
      return next;
    });
  }, []);

  const toggleSound = React.useCallback(() => setSoundEnabled((s) => !s), []);

  return {
    isDark,
    toggleDark,
    soundEnabled,
    toggleSound,
    theme,
  };
}

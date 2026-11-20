import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = "find_lost_theme";

/**
 * Global Theme State Management Provider.
 * Persists theme preference in localStorage and synchronizes with DOM data-theme attribute.
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) || "system";
  });

  const getSystemTheme = () => {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const [activeTheme, setActiveTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "dark" || saved === "light" ? saved : getSystemTheme();
  });

  // Apply theme to document element
  const applyTheme = useCallback((themeValue) => {
    const resolved = themeValue === "system" ? getSystemTheme() : themeValue;
    setActiveTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  }, []);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    const nextTheme = activeTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [activeTheme, setTheme]);

  // Sync on initial mount and when system preference changes
  useEffect(() => {
    applyTheme(theme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        activeTheme,
        isDark: activeTheme === "dark",
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;

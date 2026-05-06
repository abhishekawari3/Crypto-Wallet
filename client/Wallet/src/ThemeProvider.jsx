import { useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./theme-context";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("nexa-theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("nexa-theme", theme);
    } catch {
      // Theme persistence is optional when storage is blocked.
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <div className={`min-h-screen ${theme === "dark" ? "theme-dark" : "theme-light"}`}>{children}</div>
    </ThemeContext.Provider>
  );
}

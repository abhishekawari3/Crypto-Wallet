import { useMemo, useState } from "react";
import { ThemeContext } from "./theme-context";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");

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

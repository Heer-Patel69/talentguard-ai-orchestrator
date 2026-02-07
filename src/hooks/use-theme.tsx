import { createContext, useContext, useEffect, useState, ReactNode, useLayoutEffect } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Get initial theme synchronously to prevent flash
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored === "dark" || stored === "light") return stored;
  
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Apply theme class synchronously
function applyTheme(theme: Theme) {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Apply theme immediately on mount and whenever it changes
  useLayoutEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Also apply on initial client render to prevent hydration mismatch
  useLayoutEffect(() => {
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);
    setThemeState(initialTheme);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

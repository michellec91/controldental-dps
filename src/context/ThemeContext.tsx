"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type ThemePreference =
  | "light"
  | "dark"
  | "system";

type ThemeContextType = {
  theme: ThemePreference;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext =
  createContext<ThemeContextType | undefined>(
    undefined
  );

type Props = {
  children: ReactNode;
};

export function ThemeProvider({
  children,
}: Props) {
  const [theme, setThemeState] =
    useState<ThemePreference>("system");

  const [resolvedTheme, setResolvedTheme] =
    useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme =
      localStorage.getItem(
        "control-dental-theme"
      ) as ThemePreference | null;

    if (
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
    ) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    const aplicarTema = () => {
      const actual =
        theme === "system"
          ? mediaQuery.matches
            ? "dark"
            : "light"
          : theme;

      setResolvedTheme(actual);

      document.documentElement.dataset.theme =
        actual;
    };

    aplicarTema();

    if (theme === "system") {
      mediaQuery.addEventListener(
        "change",
        aplicarTema
      );
    }

    return () => {
      mediaQuery.removeEventListener(
        "change",
        aplicarTema
      );
    };
  }, [theme]);

  const setTheme = (
    nuevoTema: ThemePreference
  ) => {
    setThemeState(nuevoTema);

    localStorage.setItem(
      "control-dental-theme",
      nuevoTema
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme debe utilizarse dentro de ThemeProvider."
    );
  }

  return context;
}
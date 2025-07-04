"use client"

import * as React from "react"

type Theme = "light" | "dark" | "forest-green" | "ocean-blue" | "desert-sunset" | "sakura-pink";

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "habitzen-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme;
    }
    try {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    } catch (e) {
      console.error("Failed to read theme from localStorage", e);
      return defaultTheme;
    }
  });

  React.useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark", "forest-green", "ocean-blue", "desert-sunset", "sakura-pink")

    if (theme === "forest-green" || theme === "ocean-blue" || theme === "desert-sunset") {
        root.classList.add("dark")
        root.classList.add(theme)
    } else if (theme === "sakura-pink") {
        root.classList.add("light")
        root.classList.add(theme)
    } else {
        root.classList.add(theme)
    }
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme)
        setTheme(newTheme)
      } catch (e) {
        console.error("Failed to set theme in localStorage", e);
      }
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

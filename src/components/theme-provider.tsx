import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme
    const storedTheme = window.localStorage.getItem(storageKey) as Theme | null
    return storedTheme ?? defaultTheme
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const root = window.document.documentElement
    const applyTheme = (themeValue: Exclude<Theme, "system">) => {
      root.classList.remove("light", "dark")
      root.classList.add(themeValue)
      root.style.colorScheme = themeValue
    }

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const updateSystemTheme = () => {
        const systemTheme = mediaQuery.matches ? "dark" : "light"
        applyTheme(systemTheme)
      }

      updateSystemTheme()
      mediaQuery.addEventListener("change", updateSystemTheme)
      return () => mediaQuery.removeEventListener("change", updateSystemTheme)
    }

    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey) {
        const nextTheme = (event.newValue as Theme | null) ?? defaultTheme
        setThemeState(nextTheme)
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [defaultTheme, storageKey])

  const setTheme = useCallback(
    (themeValue: Theme) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, themeValue)
      }
      setThemeState(themeValue)
    },
    [storageKey]
  )

  const value = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme]
  )

  return (
    <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}

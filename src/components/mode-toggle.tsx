import { useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme, type Theme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const themeOptions: { label: string; value: Theme }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
]

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  const handleSelect = (value: Theme) => {
    setTheme(value)
    setOpen(false)
  }

  const labelMap: Record<Theme, string> = {
    dark: "Dark theme",
    light: "Light theme",
    system: "System theme",
  }

  return (
    <div className="relative inline-flex" ref={menuRef}>
      <Button
        variant="outline"
        size="icon"
        type="button"
        className="relative"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${labelMap[theme]}. Toggle theme menu`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      {open ? (
        <div
          role="menu"
          aria-label="Theme options"
          className="absolute right-0 z-10 mt-2 min-w-[8rem] rounded-md border bg-popover p-1 text-sm shadow-lg"
        >
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={theme === option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex w-full items-center justify-between rounded-sm px-3 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                theme === option.value && "bg-accent text-accent-foreground"
              )}
            >
              <span>{option.label}</span>
              {theme === option.value ? (
                <span className="text-xs uppercase text-muted-foreground">Active</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

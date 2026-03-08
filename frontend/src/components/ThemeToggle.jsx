"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    console.log(`[UI Action] Theme toggled to: ${newTheme}`);
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground transition-all duration-300 z-50 focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label="Toggle theme"
    >
      <Sun className="h-6 w-6 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-[#2563EB]" />
      <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-[#38BDF8]" />
    </button>
  );
}
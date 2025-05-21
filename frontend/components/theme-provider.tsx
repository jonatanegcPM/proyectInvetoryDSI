"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      themes={[
        "light",
        "dark",
        "emerald",
        "teal",
        "sky",
        "blue",
        "indigo",
        "purple",
        "rose",
        "amber",
        "lime",
        "cyan",
        "navy",
      ]}
      attribute="class"
    >
      {children}
    </NextThemesProvider>
  )
}

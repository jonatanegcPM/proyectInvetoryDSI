"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Save, Check } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

// Definición de los temas disponibles
interface ThemeOption {
  value: string
  label: string
  description: string
  primaryColor: string
  secondaryColor: string
  bgColor: string
  textColor: string
  isDark?: boolean
}

const themeOptions: ThemeOption[] = [
  // Temas claros
  {
    value: "light",
    label: "Claro",
    description: "Tema claro por defecto, ideal para uso diurno",
    primaryColor: "#0f172a", // Valor real: 222.2 47.4% 11.2% (slate-900)
    secondaryColor: "#f1f5f9", // Valor real: 210 40% 96.1% (slate-100)
    bgColor: "#fafafa",
    textColor: "#0f172a", // slate-900
  },
  {
    value: "emerald",
    label: "Esmeralda",
    description: "Tema con tonos verdes, ideal para farmacia",
    primaryColor: "#10b981", // emerald-500
    secondaryColor: "#f1f5f9", // slate-100 (gris claro)
    bgColor: "#f0fdf4", // emerald-50
    textColor: "#064e3b", // emerald-900
  },
  {
    value: "teal",
    label: "Turquesa",
    description: "Tonos turquesa, transmite salud y bienestar",
    primaryColor: "#14b8a6", // teal-500
    secondaryColor: "#f1f5f9", // slate-100 (gris claro)
    bgColor: "#f0fdfa", // teal-50
    textColor: "#134e4a", // teal-900
  },
  {
    value: "sky",
    label: "Cielo",
    description: "Azul médico, profesional y confiable",
    primaryColor: "#0ea5e9", // sky-500
    secondaryColor: "#f1f5f9", // slate-100 (gris claro)
    bgColor: "#f0f9ff", // sky-50
    textColor: "#0c4a6e", // sky-900
  },
  {
    value: "blue",
    label: "Azul",
    description: "Azul farmacéutico, transmite confianza",
    primaryColor: "#3b82f6", // blue-500
    secondaryColor: "#f1f5f9", // slate-100 (gris claro)
    bgColor: "#eff6ff", // blue-50
    textColor: "#1e3a8a", // blue-900
  },
  {
    value: "indigo",
    label: "Índigo",
    description: "Tonos azul-violeta, profesional y moderno",
    primaryColor: "#6366f1", // indigo-500
    secondaryColor: "#f1f5f9", // slate-100 (gris claro)
    bgColor: "#eef2ff", // indigo-50
    textColor: "#312e81", // indigo-900
  },
  {
    value: "purple",
    label: "Púrpura",
    description: "Tonos púrpura, elegante y distintivo",
    primaryColor: "#a855f7", // purple-500
    secondaryColor: "#f1f5f9", // slate-100 (gris claro)
    bgColor: "#faf5ff", // purple-50
    textColor: "#581c87", // purple-900
  },
  {
    value: "rose",
    label: "Rosa",
    description: "Tonos rosados, cálido y acogedor",
    primaryColor: "#f43f5e", // rose-500
    secondaryColor: "#f1f5f9", // slate-100 (gris claro)
    bgColor: "#fff1f2", // rose-50
    textColor: "#881337", // rose-900
  },
  {
    value: "amber",
    label: "Ámbar",
    description: "Tonos dorados, cálido y energético",
    primaryColor: "#f59e0b", // amber-500
    secondaryColor: "#f1f5f9", // slate-100 (gris claro)
    bgColor: "#fffbeb", // amber-50
    textColor: "#78350f", // amber-900
  },
  {
    value: "lime",
    label: "Lima",
    description: "Verde lima, fresco y revitalizante",
    primaryColor: "#84cc16", // lime-500
    secondaryColor: "#f1f5f9", // slate-100 (gris claro)
    bgColor: "#f7fee7", // lime-50
    textColor: "#365314", // lime-900
  },
  {
    value: "cyan",
    label: "Cian",
    description: "Azul cian, limpio y refrescante",
    primaryColor: "#06b6d4", // cyan-500
    secondaryColor: "#f1f5f9", // slate-100 (gris claro)
    bgColor: "#ecfeff", // cyan-50
    textColor: "#164e63", // cyan-900
  },

  // Temas oscuros
  {
    value: "dark",
    label: "Oscuro",
    description: "Tema oscuro para reducir la fatiga visual",
    primaryColor: "#ffffff", // Valor real: 0 0% 100% (white)
    secondaryColor: "#1e293b", // Valor real: 215 50% 10% (slate-800)
    bgColor: "#0f1629", // Aproximación de 215 50% 6%
    textColor: "#f8fafc", // slate-50
    isDark: true,
  },
  {
    value: "navy",
    label: "Azul Marino",
    description: "Tema oscuro con tonos azules, elegante y profesional",
    primaryColor: "#ffffff", // blanco
    secondaryColor: "#0f172a", // slate-900
    bgColor: "#020617", // slate-950
    textColor: "#e0f2fe", // sky-100
    isDark: true,
  },
]

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<string>("light")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"light" | "dark">("light")

  // Cargar preferencias al iniciar
  useEffect(() => {
    const loadPreferences = () => {
      try {
        // Cargar tema actual
        if (theme) {
          console.log("Tema actual:", theme)
          setSelectedTheme(theme)

          // Determinar la pestaña activa basada en si el tema es oscuro
          const themeOption = themeOptions.find((t) => t.value === theme)
          if (themeOption?.isDark) {
            setActiveTab("dark")
          } else {
            setActiveTab("light")
          }
        }
      } catch (error) {
        console.error("Error al cargar preferencias de apariencia:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Pequeño retraso para asegurar que next-themes haya cargado
    const timer = setTimeout(loadPreferences, 300)
    return () => clearTimeout(timer)
  }, [theme])

  // Manejar cambio de tema
  const handleThemeChange = (value: string) => {
    console.log("Cambiando tema a:", value)
    setSelectedTheme(value)
    setTheme(value)
  }

  // Guardar preferencias
  async function handleSave() {
    setIsSaving(true)

    try {
      // El tema ya se aplica en tiempo real con handleThemeChange
      // Simulamos un pequeño retraso para mostrar el estado de carga
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Tema guardado",
        description: `El tema "${themeOptions.find((t) => t.value === selectedTheme)?.label}" ha sido aplicado correctamente.`,
      })
    } catch (error) {
      console.error("Error al guardar la configuración:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración. Inténtelo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-4">Cargando preferencias...</div>
  }

  const lightThemes = themeOptions.filter((theme) => !theme.isDark)
  const darkThemes = themeOptions.filter((theme) => theme.isDark)

  return (
    <div className="space-y-8">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("light")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "light" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          Temas Claros
        </button>
        <button
          onClick={() => setActiveTab("dark")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "dark" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          Temas Oscuros
        </button>
      </div>

      <div className={activeTab === "light" ? "block" : "hidden"}>
        <h3 className="text-lg font-medium mb-4">Temas Claros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lightThemes.map((option) => (
            <div
              key={option.value}
              className={cn(
                "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md",
                selectedTheme === option.value
                  ? "border-primary ring-2 ring-primary ring-opacity-50"
                  : "border-border hover:border-primary/50",
              )}
              onClick={() => handleThemeChange(option.value)}
            >
              {selectedTheme === option.value && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="h-3 w-3" />
                </div>
              )}
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded-full border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: option.primaryColor }}
                />
                <div
                  className="h-6 w-6 rounded-full border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: option.secondaryColor }}
                />
              </div>
              <div
                className="mb-3 h-20 w-full rounded-md p-2 flex items-center justify-center border border-gray-200 dark:border-gray-700"
                style={{ backgroundColor: option.bgColor, color: option.textColor }}
              >
                <span className="font-medium">Vista previa</span>
              </div>
              <h4 className="font-medium">{option.label}</h4>
              <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={activeTab === "dark" ? "block" : "hidden"}>
        <h3 className="text-lg font-medium mb-4">Temas Oscuros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {darkThemes.map((option) => (
            <div
              key={option.value}
              className={cn(
                "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md",
                selectedTheme === option.value
                  ? "border-primary ring-2 ring-primary ring-opacity-50"
                  : "border-border hover:border-primary/50",
              )}
              onClick={() => handleThemeChange(option.value)}
            >
              {selectedTheme === option.value && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="h-3 w-3" />
                </div>
              )}
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded-full border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: option.primaryColor }}
                />
                <div
                  className="h-6 w-6 rounded-full border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: option.secondaryColor }}
                />
              </div>
              <div
                className="mb-3 h-20 w-full rounded-md p-2 flex items-center justify-center border border-gray-200 dark:border-gray-700"
                style={{ backgroundColor: option.bgColor, color: option.textColor }}
              >
                <span className="font-medium">Vista previa</span>
              </div>
              <h4 className="font-medium">{option.label}</h4>
              <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
        {isSaving ? (
          <>Guardando...</>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Guardar Tema
          </>
        )}
      </Button>
    </div>
  )
}

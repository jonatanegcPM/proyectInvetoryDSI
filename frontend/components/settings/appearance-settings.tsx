"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Save } from "lucide-react"
import { useTheme } from "next-themes"

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [isSaving, setIsSaving] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar preferencias al iniciar
  useEffect(() => {
    const loadPreferences = () => {
      try {
        // Cargar tema
        const currentTheme = theme || "light"
        setIsDarkMode(currentTheme === "dark")
      } catch (error) {
        console.error("Error al cargar preferencias de apariencia:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Pequeño retraso para asegurar que next-themes haya cargado
    const timer = setTimeout(loadPreferences, 100)
    return () => clearTimeout(timer)
  }, [theme])

  // Manejar cambio de tema
  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked)
    setTheme(checked ? "dark" : "light")
  }

  // Guardar preferencias
  async function handleSave() {
    setIsSaving(true)

    try {
      // El tema ya se aplica en tiempo real con handleThemeChange
      // Simulamos un pequeño retraso para mostrar el estado de carga
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Configuración guardada",
        description: "La configuración de apariencia ha sido actualizada correctamente.",
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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="dark-mode">Modo Oscuro</Label>
            <p className="text-sm text-muted-foreground">Activa el modo oscuro para reducir la fatiga visual.</p>
          </div>
          <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={handleThemeChange} />
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? (
          <>Guardando...</>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </>
        )}
      </Button>
    </div>
  )
}

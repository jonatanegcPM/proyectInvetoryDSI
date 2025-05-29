"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { Save } from "lucide-react"
import { Loader2 } from "lucide-react"
import { NotificationSettingsService } from "@/services/notification-settings-service"

type SettingsType = {
  lowStockAlerts: boolean
  expirationAlerts: boolean
  expiredProductAlerts: boolean
  editAlerts: boolean
  stockAdjustmentAlerts: boolean
  salesAlerts: boolean
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<SettingsType>({
    lowStockAlerts: true,
    expirationAlerts: true,
    expiredProductAlerts: true,
    editAlerts: true,
    stockAdjustmentAlerts: true,
    salesAlerts: true,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Cargar configuración inicial
  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true)
        const currentSettings = await NotificationSettingsService.getSettings()
        setSettings(currentSettings)
      } catch (error) {
        console.error("Error al cargar la configuración:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración de notificaciones.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleToggle = (key: keyof SettingsType) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  async function handleSave() {
    setIsSaving(true)

    try {
      const updatedSettings = await NotificationSettingsService.updateSettings(settings)
      setSettings(updatedSettings)

      toast({
        title: "Configuración guardada",
        description: "La configuración de notificaciones ha sido actualizada correctamente.",
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
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index}>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-6 w-11" />
              </div>
              {index < 5 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="low-stock-alerts">Alertas de Bajo Stock</Label>
            <p className="text-sm text-muted-foreground">
              Recibir alertas cuando los productos estén por debajo del nivel de reorden
            </p>
          </div>
          <Switch
            id="low-stock-alerts"
            checked={settings.lowStockAlerts}
            onCheckedChange={() => handleToggle("lowStockAlerts")}
            disabled={isSaving}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="expiration-alerts">Alertas de Vencimiento</Label>
            <p className="text-sm text-muted-foreground">
              Recibir alertas cuando los productos estén próximos a vencer
            </p>
          </div>
          <Switch
            id="expiration-alerts"
            checked={settings.expirationAlerts}
            onCheckedChange={() => handleToggle("expirationAlerts")}
            disabled={isSaving}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="expired-product-alerts">Alertas de producto caducado</Label>
            <p className="text-sm text-muted-foreground">Recibir alertas cuando los productos hayan caducado</p>
          </div>
          <Switch
            id="expired-product-alerts"
            checked={settings.expiredProductAlerts}
            onCheckedChange={() => handleToggle("expiredProductAlerts")}
            disabled={isSaving}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="edit-alerts">Alertas de edición</Label>
            <p className="text-sm text-muted-foreground">
              Recibir alertas cuando se editen productos o información importante
            </p>
          </div>
          <Switch
            id="edit-alerts"
            checked={settings.editAlerts}
            onCheckedChange={() => handleToggle("editAlerts")}
            disabled={isSaving}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="stock-adjustment-alerts">Alertas de ajuste de stock</Label>
            <p className="text-sm text-muted-foreground">Recibir alertas cuando se realicen ajustes en el inventario</p>
          </div>
          <Switch
            id="stock-adjustment-alerts"
            checked={settings.stockAdjustmentAlerts}
            onCheckedChange={() => handleToggle("stockAdjustmentAlerts")}
            disabled={isSaving}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sales-alerts">Alertas de ventas</Label>
            <p className="text-sm text-muted-foreground">Recibir alertas sobre actividades importantes de ventas</p>
          </div>
          <Switch
            id="sales-alerts"
            checked={settings.salesAlerts}
            onCheckedChange={() => handleToggle("salesAlerts")}
            disabled={isSaving}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
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

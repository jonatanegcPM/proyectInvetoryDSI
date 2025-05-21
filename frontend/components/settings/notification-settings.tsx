"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Save } from "lucide-react"

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    lowStockAlerts: true,
    expirationAlerts: true,
    expiredProductAlerts: true,
    editAlerts: true,
    stockAdjustmentAlerts: true,
    salesAlerts: true,
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

  async function handleSave() {
    setIsSaving(true)

    try {
      // Aquí iría la llamada a la API para guardar los datos
      console.log("Guardando configuración de notificaciones:", settings)

      // Simulamos un retraso para mostrar el estado de carga
      await new Promise((resolve) => setTimeout(resolve, 1000))

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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="low-stock-alerts">Alertas de stock bajo</Label>
            <p className="text-sm text-muted-foreground">
              Recibir alertas cuando los productos estén por debajo del nivel de reorden
            </p>
          </div>
          <Switch
            id="low-stock-alerts"
            checked={settings.lowStockAlerts}
            onCheckedChange={() => handleToggle("lowStockAlerts")}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="expiration-alerts">Alertas de vencimiento</Label>
            <p className="text-sm text-muted-foreground">
              Recibir alertas cuando los productos estén próximos a vencer
            </p>
          </div>
          <Switch
            id="expiration-alerts"
            checked={settings.expirationAlerts}
            onCheckedChange={() => handleToggle("expirationAlerts")}
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
          <Switch id="edit-alerts" checked={settings.editAlerts} onCheckedChange={() => handleToggle("editAlerts")} />
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
          />
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

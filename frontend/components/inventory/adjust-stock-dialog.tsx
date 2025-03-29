"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Save, Loader2, Pill } from "lucide-react"
import type { Product, AdjustmentData } from "@/types/inventory"

interface AdjustStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  adjustmentData: AdjustmentData
  setAdjustmentData: (data: AdjustmentData) => void
  onSave: () => void
  isSubmitting: boolean
}

export function AdjustStockDialog({
  open,
  onOpenChange,
  product,
  adjustmentData,
  setAdjustmentData,
  onSave,
  isSubmitting,
}: AdjustStockDialogProps) {
  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajustar Stock</DialogTitle>
          <DialogDescription>Ajustar el stock de {product.name}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">Stock actual: {product.stock} unidades</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustment-type">Tipo de Ajuste</Label>
            <RadioGroup
              value={adjustmentData.type}
              onValueChange={(value) => setAdjustmentData({ ...adjustmentData, type: value as any })}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Recepción" id="reception" />
                <Label htmlFor="reception" className="font-normal">
                  Recepción (Entrada)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Ajuste" id="adjustment" />
                <Label htmlFor="adjustment" className="font-normal">
                  Ajuste de Inventario
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Devolución" id="return" />
                <Label htmlFor="return" className="font-normal">
                  Devolución
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <div className="flex items-center gap-2">
              <Input
                id="quantity"
                type="number"
                value={adjustmentData.quantity}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: Number(e.target.value) })}
              />
              <span className="text-sm text-muted-foreground">unidades</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Nuevo stock: {product.stock + adjustmentData.quantity} unidades
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Razón del ajuste de stock"
              value={adjustmentData.notes}
              onChange={(e) => setAdjustmentData({ ...adjustmentData, notes: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={isSubmitting || adjustmentData.quantity === 0}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Ajuste
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


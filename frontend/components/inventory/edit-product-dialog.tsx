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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2 } from "lucide-react"
import { categories, suppliers } from "@/hooks/use-inventory"
import type { Product } from "@/types/inventory"

interface EditProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  setProduct: (product: Product) => void
  onSave: () => void
  isSubmitting: boolean
}

export function EditProductDialog({
  open,
  onOpenChange,
  product,
  setProduct,
  onSave,
  isSubmitting,
}: EditProductDialogProps) {
  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>Modifique los detalles del producto y guarde los cambios.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sku">SKU</Label>
              <Input
                id="edit-sku"
                value={product.sku}
                onChange={(e) => setProduct({ ...product, sku: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-barcode">Código de Barras</Label>
              <Input
                id="edit-barcode"
                value={product.barcode}
                onChange={(e) => setProduct({ ...product, barcode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoría</Label>
              <Select value={product.category} onValueChange={(value) => setProduct({ ...product, category: value })}>
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => c !== "Todos")
                    .map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-supplier">Proveedor</Label>
              <Select value={product.supplier} onValueChange={(value) => setProduct({ ...product, supplier: value })}>
                <SelectTrigger id="edit-supplier">
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reorderLevel">Nivel de Reorden</Label>
              <Input
                id="edit-reorderLevel"
                type="number"
                value={product.reorderLevel}
                onChange={(e) => setProduct({ ...product, reorderLevel: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Precio de Venta</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-costPrice">Precio de Costo</Label>
              <Input
                id="edit-costPrice"
                type="number"
                step="0.01"
                value={product.costPrice}
                onChange={(e) => setProduct({ ...product, costPrice: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expiryDate">Fecha de Vencimiento</Label>
              <Input
                id="edit-expiryDate"
                type="date"
                value={product.expiryDate}
                onChange={(e) => setProduct({ ...product, expiryDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Ubicación</Label>
              <Input
                id="edit-location"
                value={product.location}
                onChange={(e) => setProduct({ ...product, location: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" onClick={onSave} disabled={isSubmitting}>
            {isSubmitting ? (
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


"use client"

import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Plus } from "lucide-react"
import type { Product } from "@/types/inventory"

interface ProductDetailsDialogProps {
  product: Product | null
  onOpenChange: (open: boolean) => void
  onViewHistory: () => void
  onAdjustStock: () => void
}

export function ProductDetailsDialog({
  product,
  onOpenChange,
  onViewHistory,
  onAdjustStock,
}: ProductDetailsDialogProps) {
  if (!product) return null

  return (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>{product.name}</DialogTitle>
        <DialogDescription>Información detallada del producto</DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-semibold mb-1">SKU</h4>
            <p className="text-sm">{product.sku}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Código de Barras</h4>
            <p className="text-sm">{product.barcode || "No disponible"}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Categoría</h4>
            <p className="text-sm">{product.category}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Descripción</h4>
            <p className="text-sm">{product.description}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Ubicación</h4>
            <p className="text-sm">{product.location}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Stock</h4>
            <p className="text-sm">{product.stock} unidades</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Nivel de Reorden</h4>
            <p className="text-sm">{product.reorderLevel} unidades</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Precio de Venta</h4>
            <p className="text-sm">${product.price.toFixed(2)}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Precio de Costo</h4>
            <p className="text-sm">${product.costPrice.toFixed(2)}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Margen</h4>
            <p className="text-sm">{(((product.price - product.costPrice) / product.price) * 100).toFixed(2)}%</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Proveedor</h4>
            <p className="text-sm">{product.supplier}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Fecha de Vencimiento</h4>
            <p className="text-sm">{new Date(product.expiryDate).toLocaleDateString()}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Última Actualización</h4>
            <p className="text-sm">{new Date(product.lastUpdated).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-3">Nivel de Stock</h4>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                product.status === "in-stock"
                  ? "bg-green-500"
                  : product.status === "low-stock"
                    ? "bg-red-500"
                    : "bg-amber-500"
              }`}
              style={{
                width: `${product.reorderLevel ? Math.min((product.stock / (product.reorderLevel * 2)) * 100, 100) : 50}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">0</span>
            <span className="text-xs text-muted-foreground">{product.reorderLevel ? product.reorderLevel : "N/A"}</span>
            <span className="text-xs text-muted-foreground">
              {product.reorderLevel ? product.reorderLevel * 2 : "N/A"}
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Crítico</span>
            <span>Reorden</span>
            <span>Óptimo</span>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onViewHistory}>
          <FileText className="mr-2 h-4 w-4" />
          Historial
        </Button>
        <Button onClick={onAdjustStock}>
          <Plus className="mr-2 h-4 w-4" />
          Ajustar Stock
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

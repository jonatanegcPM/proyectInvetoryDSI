"use client"

import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Plus } from "lucide-react"
import type { Product } from "@/types/inventory"
import Barcode from "react-barcode"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

  const TruncatedText = ({ text, maxLength = 30 }: { text: string; maxLength?: number }) => {
    if (!text) return <p className="text-sm">No disponible</p>

    if (text.length <= maxLength) return <p className="text-sm">{text}</p>

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-sm truncate max-w-full" style={{ cursor: "help" }}>
              {text}
            </p>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start" className="max-w-[300px] break-words">
            {text}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{product.name}</DialogTitle>
        <DialogDescription>Información detallada del producto</DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-semibold mb-1">SKU</h4>
            <TruncatedText text={product.sku} />
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Código de Barras</h4>
            {product.barcode ? (
              <div className="mt-2 flex flex-col items-center">
                <Barcode value={product.barcode} width={1.5} height={50} fontSize={12} margin={5} />
                <p className="text-sm mt-1">{product.barcode}</p>
              </div>
            ) : (
              <p className="text-sm">No disponible</p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Categoría</h4>
            <TruncatedText text={product.category} />
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Descripción</h4>
            <TruncatedText text={product.description} maxLength={50} />
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Ubicación</h4>
            <TruncatedText text={product.location} />
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
            <TruncatedText text={product.supplier} />
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

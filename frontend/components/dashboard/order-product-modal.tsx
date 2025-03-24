import { AlertCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { InventoryItem } from "@/types/dashboard"

interface OrderProductModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  inventoryItem: InventoryItem | null
}

export function OrderProductModal({ isOpen, onOpenChange, inventoryItem }: OrderProductModalProps) {
  if (!inventoryItem) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ordenar Producto</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas generar una orden de compra para este producto?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="font-medium">
              Stock crítico: {inventoryItem.currentStock} / {inventoryItem.minStock}
            </span>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Producto</h4>
                <p className="text-base">{inventoryItem.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Categoría</h4>
                <p className="text-base">{inventoryItem.category}</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Cantidad Sugerida</h4>
              <p className="text-base">{inventoryItem.minStock * 2 - inventoryItem.currentStock}</p>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction>Generar Orden</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


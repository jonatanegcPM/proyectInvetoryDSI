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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart4, Pill, Loader2 } from "lucide-react"
import type { Product, InventoryTransaction } from "@/types/inventory"

interface ProductHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  transactions: InventoryTransaction[]
  isLoading?: boolean
}

export function ProductHistoryDialog({
  open,
  onOpenChange,
  product,
  transactions,
  isLoading = false,
}: ProductHistoryDialogProps) {
  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Historial de Producto</DialogTitle>
          <DialogDescription>Historial de transacciones para {product.name}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold">Transacciones Recientes</h4>
              <Button variant="outline" size="sm">
                <BarChart4 className="h-4 w-4 mr-2" />
                Ver Reporte
              </Button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Cargando transacciones...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions && transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                transaction.type === "Recepción"
                                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50"
                                  : transaction.type === "Venta"
                                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50"
                                    : transaction.type === "Ajuste"
                                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50"
                                      : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/50"
                              }
                            >
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell className={transaction.quantity < 0 ? "text-red-600" : "text-green-600"}>
                            {transaction.quantity > 0 ? `+${transaction.quantity}` : transaction.quantity}
                          </TableCell>
                          <TableCell>{transaction.userName}</TableCell>
                          <TableCell>{transaction.notes}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No hay transacciones para este producto
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
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
import { Loader2, Printer } from "lucide-react"
import type { TransactionDetails } from "@/services/dashboard-service"
import { generateTransactionPDF } from "@/lib/pdf-generator"

interface TransactionDetailsModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  transaction: TransactionDetails | null
  isLoading: boolean
}

export function TransactionDetailsModal({
  isOpen,
  onOpenChange,
  transaction,
  isLoading,
}: TransactionDetailsModalProps) {
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!transaction) return null

  const handlePrint = () => {
    // Generar el PDF y abrirlo en una nueva ventana
    const pdfBlob = generateTransactionPDF(transaction)
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles de la Transacción</DialogTitle>
          <DialogDescription>Información detallada de la transacción {transaction.id}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">ID de Transacción</h4>
              <p className="text-base">{transaction.id}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Fecha</h4>
              <p className="text-base">{format(new Date(transaction.date), "dd/MM/yyyy HH:mm")}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Cliente</h4>
              <p className="text-base">{transaction.customer}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Estado</h4>
              <Badge
                variant="outline"
                className={
                  transaction.status === "completed"
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50"
                    : transaction.status === "pending"
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50"
                      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50"
                }
              >
                {transaction.status === "completed"
                  ? "Completado"
                  : transaction.status === "pending"
                    ? "Pendiente"
                    : "Cancelado"}
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Productos</h4>
            <div className="max-h-[250px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio Unitario</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaction.products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>${product.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>${product.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between">
              <span className="font-medium">Subtotal:</span>
              <span>${transaction.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">IVA (13%):</span>
              <span>${transaction.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-2">
              <span>Total:</span>
              <span>${transaction.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

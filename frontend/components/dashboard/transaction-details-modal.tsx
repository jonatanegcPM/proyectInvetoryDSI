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
import type { TransactionDetails } from "@/types/dashboard"

interface TransactionDetailsModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  transaction: TransactionDetails | null
}

export function TransactionDetailsModal({ isOpen, onOpenChange, transaction }: TransactionDetailsModalProps) {
  if (!transaction) return null

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
              <p className="text-base">{format(new Date(transaction.date), "dd/MM/yyyy")}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Cliente</h4>
              <p className="text-base">{transaction.customer}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Estado</h4>
              <Badge
                variant={
                  transaction.status === "completed"
                    ? "success"
                    : transaction.status === "pending"
                      ? "warning"
                      : "destructive"
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
            <Table>
              <TableHeader>
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

          <div className="border-t pt-4">
            <div className="flex justify-between">
              <span className="font-medium">Subtotal:</span>
              <span>${transaction.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">IVA (16%):</span>
              <span>${transaction.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-2">
              <span>Total:</span>
              <span>${transaction.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Imprimir</Button>
          <Button variant="outline">Enviar por Email</Button>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


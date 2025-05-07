"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OrderDetailsDialogProps } from "@/types/suppliers"

export function OrderDetailsDialog({ order, isOpen, onOpenChange }: OrderDetailsDialogProps) {
  if (!order) return null

  // Calcular el total de los items
  const total = order.orderItems
    ? order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : order.total

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Detalles del Pedido</DialogTitle>
          <DialogDescription>
            Pedido {order.id} a {order.supplierName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Fecha del Pedido</h4>
              <p className="text-sm flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {format(new Date(order.date), "dd/MM/yyyy")}
              </p>
            </div>
            {order.expectedDate && (
              <div>
                <h4 className="text-sm font-medium mb-1">Fecha Esperada de Entrega</h4>
                <p className="text-sm flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {format(new Date(order.expectedDate), "dd/MM/yyyy")}
                </p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium mb-1">Estado</h4>
              <Badge
                variant="outline"
                className={cn(
                  order.status === "Recibido"
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
                )}
              >
                {order.status}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Total</h4>
              <p className="text-sm font-semibold">${total.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Productos</h4>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unitario</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.orderItems && order.orderItems.length > 0 ? (
                    order.orderItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No hay detalles disponibles para este pedido
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

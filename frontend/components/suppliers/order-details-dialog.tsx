"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { AlertCircle, CalendarIcon, Loader2, PackageCheck, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
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
import type { OrderDetailsDialogProps } from "@/types/suppliers"

export function OrderDetailsDialog({
  order,
  isOpen,
  onOpenChange,
  onUpdateStatus,
  isStatusUpdateProcessing,
}: OrderDetailsDialogProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showReceiveConfirm, setShowReceiveConfirm] = useState(false)

  // Mapear el estado a un texto en español y un color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "received":
      case "recibido":
        return {
          text: "Recibido",
          className:
            "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
        }
      case "cancelled":
      case "cancelado":
        return {
          text: "Cancelado",
          className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
        }
      case "pending":
      case "pendiente":
      default:
        return {
          text: "Pendiente",
          className:
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
        }
    }
  }

  const statusBadge = order ? getStatusBadge(order.status) : getStatusBadge("pending")

  // Determinar si el pedido está pendiente
  const isPending = order
    ? order.status.toLowerCase() === "pendiente" || order.status.toLowerCase() === "pending"
    : false

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Detalles del Pedido</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
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
                <Badge variant="outline" className={cn(statusBadge.className)}>
                  {statusBadge.text}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Total</h4>
                <p className="text-sm font-semibold">${order.total?.toFixed(2) || "0.00"}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Productos</h4>
              <div className="rounded-md border">
                <div className="relative">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Precio Unitario</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                  <div className="max-h-[200px] overflow-auto">
                    <Table>
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
            </div>

            {order.notes && (
              <div>
                <h4 className="text-sm font-medium mb-1">Notas</h4>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {isPending && onUpdateStatus && (
          <>
            <div className="border-t pt-4 mt-2">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Actualizar estado del pedido
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={isStatusUpdateProcessing}
                    className="h-auto py-3 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-900 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:hover:bg-red-900/50 dark:text-red-300 dark:hover:text-red-200 transition-all"
                  >
                    <div className="flex flex-col items-center w-full">
                      <XCircle className="h-5 w-5 mb-1" />
                      <span className="text-xs font-medium">Cancelar</span>
                    </div>
                  </Button>
                  <span className="text-[10px] text-center mt-1 text-muted-foreground">No actualiza inventario</span>
                </div>

                <div className="flex flex-col">
                  <Button
                    variant="outline"
                    onClick={() => setShowReceiveConfirm(true)}
                    disabled={isStatusUpdateProcessing}
                    className="h-auto py-3 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-900 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:hover:bg-green-900/50 dark:text-green-300 dark:hover:text-green-200 transition-all"
                  >
                    <div className="flex flex-col items-center w-full">
                      <PackageCheck className="h-5 w-5 mb-1" />
                      <span className="text-xs font-medium">Recibido</span>
                    </div>
                  </Button>
                  <span className="text-[10px] text-center mt-1 text-muted-foreground">Actualiza inventario</span>
                </div>
              </div>
            </div>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Cancelar este pedido?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. El pedido será marcado como cancelado y no actualizará el
                    inventario.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Volver</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setShowCancelConfirm(false)
                      onUpdateStatus(order.id, "cancelled")
                    }}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  >
                    {isStatusUpdateProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>Confirmar</>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Receive Confirmation Dialog */}
            <AlertDialog open={showReceiveConfirm} onOpenChange={setShowReceiveConfirm}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Marcar pedido como recibido?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción actualizará automáticamente el inventario con las cantidades de productos en este
                    pedido.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Volver</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setShowReceiveConfirm(false)
                      onUpdateStatus(order.id, "received")
                    }}
                    className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
                  >
                    {isStatusUpdateProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>Confirmar</>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

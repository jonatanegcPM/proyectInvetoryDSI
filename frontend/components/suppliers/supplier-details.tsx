"use client"

import { CreditCard, Mail, Phone, MapPin, Package, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { SupplierDetailsProps } from "@/types/suppliers"
import { formatDate } from "@/hooks/use-suppliers"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function SupplierDetails({ supplier, products, orders, onNewOrder }: SupplierDetailsProps) {
  if (!supplier) return null

  const getStatusBadgeStyles = (status: string) => {
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

  const TruncatedText = ({ text, maxLength = 30 }: { text: string; maxLength?: number }) => {
    if (!text) return <span className="text-muted-foreground italic">No disponible</span>

    if (text.length <= maxLength) return <span>{text}</span>

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="truncate block max-w-full" style={{ cursor: "help" }}>
              {text}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start" className="max-w-[300px] break-words">
            {text}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <>
      <div className="py-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold">
              <TruncatedText text={supplier.name} maxLength={40} />
            </h3>
            <p className="text-sm text-muted-foreground">
              ID: {supplier.id} • Categoría: <TruncatedText text={supplier.category} maxLength={20} />
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              supplier.status === "active"
                ? "ml-auto bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                : supplier.status === "inactive"
                  ? "ml-auto bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
                  : "ml-auto bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
            }
          >
            {supplier.status === "active" ? "Activo" : supplier.status === "inactive" ? "Inactivo" : "Pendiente"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-sm font-semibold mb-2">Información de Contacto</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm">
                    <TruncatedText text={supplier.email} maxLength={25} />
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Teléfono</p>
                  <p className="text-sm">{supplier.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Dirección</p>
                  <p className="text-sm">
                    <TruncatedText text={supplier.address} maxLength={40} />
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Información Adicional</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Contacto Principal</p>
                  <p className="text-sm">
                    <TruncatedText text={supplier.contact} maxLength={25} />
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Productos</p>
                  <p className="text-sm">{supplier.products} productos</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Último Pedido</p>
                  <p className="text-sm">{formatDate(supplier.lastOrder)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="mb-4">
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
          </TabsList>
          <TabsContent value="products">
            <div className="rounded-md border">
              <div className="relative">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Precio</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
                <ScrollArea className="h-[200px]">
                  <Table>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="font-medium truncate max-w-[180px] block">{product.name}</span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="start">
                                  {product.name}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="truncate max-w-[120px] block">{product.category}</span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="start">
                                  {product.category}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="orders">
            <div className="rounded-md border">
              <div className="relative">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead>ID Pedido</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Productos</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
                <ScrollArea className="h-[200px]">
                  <Table>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{formatDate(order.date)}</TableCell>
                          <TableCell>{order.items}</TableCell>
                          <TableCell>${order.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeStyles(order.status).className}>
                              {getStatusBadgeStyles(order.status).text}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <DialogFooter>
        <Button onClick={() => onNewOrder && onNewOrder(supplier)}>
          <Truck className="mr-2 h-4 w-4" />
          Nuevo Pedido
        </Button>
      </DialogFooter>
    </>
  )
}

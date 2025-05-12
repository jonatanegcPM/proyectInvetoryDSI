"use client"

import { ArrowUpDown, FileText, MoreHorizontal } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDate } from "@/hooks/use-suppliers"
import type { SupplierOrder } from "@/types/suppliers"

interface OrdersTableProps {
  orders: SupplierOrder[]
  sortConfig: { key: string; direction: "ascending" | "descending" }
  onRequestSort: (key: string) => void
  onViewOrderDetails: (order: SupplierOrder) => void
}

export function OrdersTable({ orders, sortConfig, onRequestSort, onViewOrderDetails }: OrdersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button variant="ghost" onClick={() => onRequestSort("id")} className="flex items-center">
              ID Pedido
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onRequestSort("supplierName")} className="flex items-center">
              Proveedor
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onRequestSort("date")} className="flex items-center">
              Fecha
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onRequestSort("items")} className="flex items-center">
              Productos
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onRequestSort("total")} className="flex items-center">
              Total
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onRequestSort("status")} className="flex items-center">
              Estado
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.id}</TableCell>
            <TableCell>{order.supplierName}</TableCell>
            <TableCell>{formatDate(order.date)}</TableCell>
            <TableCell>{order.items}</TableCell>
            <TableCell>${order.total.toFixed(2)}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  order.status === "Recibido"
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                    : order.status === "Cancelado"
                      ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                }
              >
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Acciones</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewOrderDetails(order)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Ver Detalles
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

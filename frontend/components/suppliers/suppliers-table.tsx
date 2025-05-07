"use client"

import { ArrowUpDown, Edit, FileText, Mail, MoreHorizontal, Phone, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { formatDate } from "@/hooks/use-suppliers"
import type { SuppliersTableProps } from "@/types/suppliers"

export function SuppliersTable({
  suppliers,
  sortConfig,
  onRequestSort,
  onViewDetails,
  onEditSupplier,
  onDeleteSupplier,
  onNewOrder,
}: SuppliersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button variant="ghost" onClick={() => onRequestSort("name")} className="flex items-center">
              Nombre
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Contacto</TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onRequestSort("category")} className="flex items-center">
              Categoría
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onRequestSort("products")} className="flex items-center">
              Productos
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onRequestSort("lastOrder")} className="flex items-center">
              Último Pedido
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.map((supplier) => (
          <TableRow key={supplier.id}>
            <TableCell className="font-medium">{supplier.name}</TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <Mail className="mr-1 h-3 w-3 text-muted-foreground" />
                  {supplier.email}
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="mr-1 h-3 w-3 text-muted-foreground" />
                  {supplier.phone}
                </div>
              </div>
            </TableCell>
            <TableCell>{supplier.category}</TableCell>
            <TableCell>{supplier.products}</TableCell>
            <TableCell>{formatDate(supplier.lastOrder)}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  supplier.status === "active"
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                    : supplier.status === "inactive"
                      ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                }
              >
                {supplier.status === "active" ? "Activo" : supplier.status === "inactive" ? "Inactivo" : "Pendiente"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Dialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DialogTrigger asChild>
                      <DropdownMenuItem onClick={() => onViewDetails(supplier)}>Ver detalles</DropdownMenuItem>
                    </DialogTrigger>
                    <DropdownMenuItem onClick={() => onEditSupplier(supplier)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNewOrder(supplier)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Nuevo Pedido
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={() => onDeleteSupplier(supplier)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

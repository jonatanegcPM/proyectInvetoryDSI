"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ArrowUpDown, Edit, Mail, MoreHorizontal, Phone, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { formatDate } from "@/hooks/use-customers"
import type { CustomersTableProps } from "@/types/customers"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function CustomersTable({
  customers,
  sortConfig,
  onRequestSort,
  onViewDetails,
  onEditCustomer,
  onDeleteCustomer,
}: CustomersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">
            <Button variant="ghost" onClick={() => onRequestSort("CustomerID")} className="flex items-center">
              ID
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onRequestSort("name")} className="flex items-center">
              Nombre
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Contacto</TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onRequestSort("LastVisit")} className="flex items-center">
              Última Visita
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onRequestSort("Insurance")} className="flex items-center">
              Seguro
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onRequestSort("Status")} className="flex items-center">
              Estado
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell className="font-medium">{customer.id}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="font-medium truncate max-w-[150px]">{customer.name}</p>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="start">
                        {customer.name}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(customer.dateOfBirth)} • {customer.gender}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-sm">
                        <Mail className="mr-1 h-3 w-3 text-muted-foreground" />
                        <span className="truncate max-w-[150px]">{customer.email}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="start">
                      {customer.email}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex items-center text-sm">
                  <Phone className="mr-1 h-3 w-3 text-muted-foreground" />
                  {customer.phone}
                </div>
              </div>
            </TableCell>
            <TableCell>{formatDate(customer.lastVisit)}</TableCell>
            <TableCell>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="max-w-[150px] truncate" title={customer.insurance || "Sin seguro"}>
                      {customer.insurance || <span className="text-muted-foreground italic">Sin seguro</span>}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start">
                    {customer.insurance || "Sin seguro"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  customer.status === "active"
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
                }
              >
                {customer.status === "active" ? "Activo" : "Inactivo"}
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
                      <DropdownMenuItem onClick={() => onViewDetails(customer)}>Ver detalles</DropdownMenuItem>
                    </DialogTrigger>
                    <DropdownMenuItem onClick={() => onEditCustomer(customer)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={() => onDeleteCustomer(customer)}>
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

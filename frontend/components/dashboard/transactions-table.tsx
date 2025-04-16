"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, FileText, Loader2, ArrowUpDown } from "lucide-react"
import { format, isToday, isThisWeek, isThisMonth, isThisYear } from "date-fns"
import { es } from "date-fns/locale" // Importa el locale 'es'
import type { Transaction } from "@/services/dashboard-service"
import { useState } from "react"

// Tipo para las columnas ordenables
type SortableColumn = "id" | "customer" | "items" | "amount" | "status" | "date"

interface TransactionsTableProps {
  transactions: Transaction[]
  isLoading: boolean
  onViewDetails: (transactionId: string) => void
}

export function TransactionsTable({ transactions, isLoading, onViewDetails }: TransactionsTableProps) {
  // Estado para el ordenamiento
  const [sortColumn, setSortColumn] = useState<SortableColumn | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Función para cambiar el ordenamiento
  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      // Si ya estamos ordenando por esta columna, cambiamos la dirección
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Si es una nueva columna, la establecemos como columna de ordenamiento y dirección ascendente
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Ordenar las transacciones
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!sortColumn) return 0

    let valueA, valueB

    switch (sortColumn) {
      case "id":
        valueA = a.id
        valueB = b.id
        break
      case "customer":
        valueA = a.customer
        valueB = b.customer
        break
      case "items":
        valueA = a.items
        valueB = b.items
        break
      case "amount":
        valueA = a.amount
        valueB = b.amount
        break
      case "status":
        valueA = a.status
        valueB = b.status
        break
      case "date":
        valueA = new Date(a.date).getTime()
        valueB = new Date(b.date).getTime()
        break
      default:
        return 0
    }

    if (valueA < valueB) {
      return sortDirection === "asc" ? -1 : 1
    }
    if (valueA > valueB) {
      return sortDirection === "asc" ? 1 : -1
    }
    return 0
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <FileText className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No hay transacciones</h3>
        <p className="text-sm text-muted-foreground">No se encontraron transacciones con los filtros actuales.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="cursor-pointer" onClick={() => handleSort("id")}>
            <div className="flex items-center">
              ID Transacción
              <ArrowUpDown className="ml-1 h-4 w-4" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort("customer")}>
            <div className="flex items-center">
              Cliente
              <ArrowUpDown className="ml-1 h-4 w-4" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort("items")}>
            <div className="flex items-center">
              Artículos
              <ArrowUpDown className="ml-1 h-4 w-4" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort("amount")}>
            <div className="flex items-center">
              Monto
              <ArrowUpDown className="ml-1 h-4 w-4" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
            <div className="flex items-center">
              Estado
              <ArrowUpDown className="ml-1 h-4 w-4" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
            <div className="flex items-center">
              Fecha
              <ArrowUpDown className="ml-1 h-4 w-4" />
            </div>
          </TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedTransactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="font-medium">{transaction.id}</TableCell>
            <TableCell>{transaction.customer}</TableCell>
            <TableCell>{transaction.items}</TableCell>
            <TableCell>${transaction.amount.toFixed(2)}</TableCell>
            <TableCell>
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
            </TableCell>
            <TableCell>
              {(() => {
                const date = new Date(transaction.date)
                if (isToday(date)) {
                  return "Hoy, " + format(date, "HH:mm")
                } else if (isThisWeek(date)) {
                  return format(date, "EEEE", { locale: es }) // Requiere importar 'es' de date-fns/locale
                } else if (isThisMonth(date)) {
                  return format(date, "d 'de' MMMM", { locale: es })
                } else if (isThisYear(date)) {
                  return format(date, "d 'de' MMMM", { locale: es })
                } else {
                  return format(date, "dd/MM/yyyy")
                }
              })()}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onViewDetails(transaction.id)}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">Ver detalles</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, FileText, Loader2 } from "lucide-react"
import { format, isToday, isThisWeek, isThisMonth, isThisYear } from "date-fns"
import { es } from "date-fns/locale" // Importa el locale 'es'
import type { Transaction } from "@/services/dashboard-service"

interface TransactionsTableProps {
  transactions: Transaction[]
  isLoading: boolean
  onViewDetails: (transactionId: string) => void
}

export function TransactionsTable({ transactions, isLoading, onViewDetails }: TransactionsTableProps) {
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
          <TableHead>ID Transacción</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Artículos</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="font-medium">{transaction.id}</TableCell>
            <TableCell>{transaction.customer}</TableCell>
            <TableCell>{transaction.items}</TableCell>
            <TableCell>${transaction.amount.toFixed(2)}</TableCell>
            <TableCell>
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


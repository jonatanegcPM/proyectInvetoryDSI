"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, FileText, Loader2, ArrowUpDown } from "lucide-react"
import { format, isToday, isThisWeek, isThisMonth, isThisYear } from "date-fns"
import { es } from "date-fns/locale"
import type { Transaction } from "@/services/dashboard-service"

type SortableColumn = "id" | "customer" | "items" | "amount" | "status" | "date"

interface AnimatedTransactionsTableProps {
  transactions: Transaction[]
  isLoading: boolean
  onViewDetails: (transactionId: string) => void
}

export function AnimatedTransactionsTable({ transactions, isLoading, onViewDetails }: AnimatedTransactionsTableProps) {
  const [sortColumn, setSortColumn] = useState<SortableColumn | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-6 text-center"
      >
        <FileText className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No hay transacciones</h3>
        <p className="text-sm text-muted-foreground">No se encontraron transacciones con los filtros actuales.</p>
      </motion.div>
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
        <AnimatePresence>
          {sortedTransactions.map((transaction, index) => (
            <motion.tr
              key={transaction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeOut",
              }}
              onMouseEnter={() => setHoveredRow(transaction.id)}
              onMouseLeave={() => setHoveredRow(null)}
              className={`
                relative transition-colors duration-200
                ${hoveredRow === transaction.id ? "bg-muted/50" : ""}
              `}
              style={{ position: "relative" }}
            >
              <TableCell className="font-medium">{transaction.id}</TableCell>
              <TableCell>{transaction.customer}</TableCell>
              <TableCell>{transaction.items}</TableCell>
              <TableCell>
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  ${transaction.amount.toFixed(2)}
                </motion.span>
              </TableCell>
              <TableCell>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
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
                </motion.div>
              </TableCell>
              <TableCell>
                {(() => {
                  const date = new Date(transaction.date)
                  if (isToday(date)) {
                    return "Hoy, " + format(date, "HH:mm")
                  } else if (isThisWeek(date)) {
                    return format(date, "EEEE", { locale: es })
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
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(transaction.id)}
                    className="relative overflow-hidden"
                  >
                    <Eye className="h-4 w-4" />
                    {hoveredRow === transaction.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 bg-primary/10 rounded-full"
                        style={{ zIndex: -1 }}
                      />
                    )}
                    <span className="sr-only">Ver detalles</span>
                  </Button>
                </motion.div>
              </TableCell>
            </motion.tr>
          ))}
        </AnimatePresence>
      </TableBody>
    </Table>
  )
}

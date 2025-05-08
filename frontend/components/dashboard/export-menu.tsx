"use client"

import { Download, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { exportToPDF, exportToCSV, exportToJSON } from "@/lib/export-utils"
import { useState } from "react"
import { DashboardService } from "@/services/dashboard-service"
import type { Transaction } from "@/services/dashboard-service"

interface ExportMenuProps {
  transactions?: Transaction[]
  dateFilter?: string
  isLoading?: boolean
}

export function ExportMenu({ transactions = [], dateFilter = "all", isLoading = false }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false)

  // Asegurarse de que estamos obteniendo transacciones completas con todos los detalles
  // Modificar la función handleExport para obtener los detalles completos de cada transacción

  const handleExport = async (format: "pdf" | "csv" | "json") => {
    if (isLoading || isExporting) return

    try {
      setIsExporting(true)

      // Fetch all transactions for the current date filter
      // Use a large limit to get all transactions in one request
      //console.log(`Fetching all transactions for export with filter: ${dateFilter}`)
      const response = await DashboardService.getTransactions(dateFilter as any, 1, 1000)
      const allTransactions = response.transactions || []

      // Para cada transacción, obtener sus detalles completos incluyendo el método de pago
      const detailedTransactions = await Promise.all(
        allTransactions.map(async (transaction) => {
          try {
            // Obtener detalles completos de la transacción
            const details = await DashboardService.getTransactionDetails(transaction.id)
            return {
              ...transaction,
              paymentMethod: details.paymentMethod,
            }
          } catch (error) {
            console.error(`Error fetching details for transaction ${transaction.id}:`, error)
            return transaction
          }
        }),
      )

      console.log(
        `Exporting ${detailedTransactions.length} transactions in format ${format} for the period ${dateFilter}`,
      )

      switch (format) {
        case "pdf":
          exportToPDF(detailedTransactions, dateFilter)
          break
        case "csv":
          exportToCSV(detailedTransactions, dateFilter)
          break
        case "json":
          exportToJSON(detailedTransactions, dateFilter)
          break
      }
    } catch (error) {
      console.error("Error exporting data:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading || isExporting || transactions.length === 0}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Exportando...</span>
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          disabled={isLoading || isExporting || transactions.length === 0}
        >
          <FileText className="mr-2 h-4 w-4" />
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("json")}
          disabled={isLoading || isExporting || transactions.length === 0}
        >
          <FileText className="mr-2 h-4 w-4" />
          JSON
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          disabled={isLoading || isExporting || transactions.length === 0}
        >
          <FileText className="mr-2 h-4 w-4" />
          CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

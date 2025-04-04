"use client"

import { Download, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { exportToPDF, exportToCSV, exportToExcel } from "@/lib/export-utils"
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

  const handleExport = async (format: "pdf" | "csv" | "excel") => {
    if (isLoading || isExporting) return

    try {
      setIsExporting(true)

      // Fetch all transactions for the current date filter
      // Use a large limit to get all transactions in one request
      //console.log(`Fetching all transactions for export with filter: ${dateFilter}`)
      const response = await DashboardService.getTransactions(dateFilter as any, 1, 1000)
      const allTransactions = response.transactions || []

      //console.log(`Exporting ${allTransactions.length} transactions in format ${format} for the period ${dateFilter}`)

      switch (format) {
        case "pdf":
          exportToPDF(allTransactions, dateFilter)
          break
        case "csv":
          exportToCSV(allTransactions, dateFilter)
          break
        case "excel":
          exportToExcel(allTransactions, dateFilter)
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
          onClick={() => handleExport("excel")}
          disabled={isLoading || isExporting || transactions.length === 0}
        >
          <FileText className="mr-2 h-4 w-4" />
          Excel
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


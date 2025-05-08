"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileDown, Download } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ExportMenuProps {
  onExport: (format: string) => void
  isSubmitting: boolean
  disabled?: boolean
}

// This component is used to export inventory data in different formats (PDF, CSV, Excel)
// It receives an onExport function that handles the export logic
// The isSubmitting prop is used to disable the buttons while exporting
// The disabled prop is used to disable the export functionality when needed
export function ExportMenu({ onExport, isSubmitting, disabled = false }: ExportMenuProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isSubmitting || disabled}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport("csv")} disabled={isSubmitting || disabled}>
                <FileDown className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("json")} disabled={isSubmitting || disabled}>
                <FileDown className="mr-2 h-4 w-4" />
                JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("pdf")} disabled={isSubmitting || disabled}>
                <FileDown className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Exportar inventario</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

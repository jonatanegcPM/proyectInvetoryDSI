"use client"

import { Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"

interface ExportMenuProps {
  onExport: (format: "csv" | "json" | "pdf", type: "suppliers" | "orders") => void
  isExporting: boolean
  disabled: boolean
  hasOrders?: boolean
}

export function ExportMenu({ onExport, isExporting, disabled, hasOrders = true }: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exportando..." : "Exportar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileText className="mr-2 h-4 w-4" />
            Proveedores
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={() => onExport("csv", "suppliers")}
              disabled={isExporting}
              className="cursor-pointer"
            >
              <FileText className="mr-2 h-4 w-4" />
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onExport("json", "suppliers")}
              disabled={isExporting}
              className="cursor-pointer"
            >
              <FileText className="mr-2 h-4 w-4" />
              JSON
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onExport("pdf", "suppliers")}
              disabled={isExporting}
              className="cursor-pointer"
            >
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {hasOrders && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FileText className="mr-2 h-4 w-4" />
                Pedidos
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => onExport("csv", "orders")}
                  disabled={isExporting}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onExport("json", "orders")}
                  disabled={isExporting}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  JSON
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onExport("pdf", "orders")}
                  disabled={isExporting}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

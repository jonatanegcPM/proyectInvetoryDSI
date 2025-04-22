"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
  startIndex: number
  endIndex: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
  disabled?: boolean
}

export function TablePagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onItemsPerPageChange,
  disabled = false,
}: TablePaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Mostrando {totalItems > 0 ? `${startIndex + 1}-${Math.min(endIndex, totalItems)} de ${totalItems}` : "0 resultados"}
        </p>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange(Number(value))}
          disabled={disabled || totalItems === 0}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder="5" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1 || totalItems === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages || totalItems === 0}
        >
          Siguiente
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}


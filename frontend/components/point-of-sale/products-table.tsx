"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2 } from "lucide-react"
import type { ProductsTableProps } from "@/types/point-of-sale"

export function ProductsTable({
  products,
  onAddToCart,
  currentPage,
  totalPages,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPage,
  totalItems,
  startIndex,
  endIndex,
  isLoading,
}: ProductsTableProps) {
  // Helper function to determine badge properties
  const getBadgeProps = (product: any) => {
    // Check if product has stock and reorderLevel properties
    const stock = product.stock ?? 0
    const reorderLevel = product.reorderLevel ?? 0

    // Critical stock (less than 50% of reorder level)
    if (stock < reorderLevel * 0.5) {
      return {
        className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50",
        status: "Stock Crítico",
      }
    }

    // Low stock (less than reorder level)
    if (stock < reorderLevel) {
      return {
        className:
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50",
        status: "Stock Bajo",
      }
    }

    // In stock (default)
    return {
      className:
        "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50",
      status: "En Stock",
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                {isLoading ? (
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <p className="text-muted-foreground">No se encontraron productos</p>
                )}
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const { className, status } = getBadgeProps(product)
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={className}>
                      {status} ({product.stock})
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => onAddToCart(product)}>
                      <Plus className="h-4 w-4 mr-1" /> Añadir
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
      {totalItems > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems}
            </p>
            <select
              className="h-8 w-[70px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={itemsPerPage.toString()}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              disabled={isLoading}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

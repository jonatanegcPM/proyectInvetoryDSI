"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={
                      product.stock < 10
                        ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50"
                        : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50"
                    }
                  >
                    {product.stock < 10 ? "Bajo Stock" : "En Stock"} ({product.stock})
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => onAddToCart(product)}>
                    <Plus className="h-4 w-4 mr-1" /> Añadir
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems}
            </p>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => onItemsPerPageChange(Number(value))}
              disabled={isLoading}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder="5" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
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

"use client"

import { ArrowUpDown, MoreHorizontal, Pill, Edit, Plus, FileText, Trash2, Package } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Product } from "@/types/inventory"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProductsTableProps {
  products: Product[]
  isLoading: boolean
  onSort: (key: string) => void
  onViewDetails: (product: Product) => void
  onEdit: (product: Product) => void
  onAdjustStock: (product: Product) => void
  onViewHistory: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductsTable({
  products,
  isLoading,
  onSort,
  onViewDetails,
  onEdit,
  onAdjustStock,
  onViewHistory,
  onDelete,
}: ProductsTableProps) {
  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <Button variant="ghost" onClick={() => onSort("name")} className="flex items-center">
                  Producto
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => onSort("category")} className="flex items-center">
                  Categoría
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => onSort("stock")} className="flex items-center">
                  Stock
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => onSort("price")} className="flex items-center">
                  Precio
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => onSort("expiryDate")} className="flex items-center">
                  Vencimiento
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="h-8 w-8 mb-2" />
                    <p>No se encontraron productos</p>
                    <p className="text-sm">Intente con otra búsqueda o categoría</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <Pill className="h-5 w-5" />
                      </div>
                      <div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="font-medium truncate max-w-[180px]">{product.name}</p>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="start">
                              {product.name}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                {product.description}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="start">
                              {product.description}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate max-w-[120px] inline-block">{product.category}</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="start">
                          {product.category}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span>{product.stock}</span>
                        <span className="text-xs text-muted-foreground">/{product.reorderLevel}</span>
                      </div>
                      <Progress
                        value={Math.min((product.stock / product.reorderLevel) * 100, 100)}
                        className={
                          product.status === "low-stock"
                            ? "bg-red-900/30 dark:bg-red-900/20"
                            : product.status === "medium-stock"
                              ? "bg-amber-900/30 dark:bg-amber-900/20"
                              : "bg-green-900/30 dark:bg-green-900/20"
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{new Date(product.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        product.stock < product.reorderLevel * 0.5
                          ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50"
                          : product.stock < product.reorderLevel
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50"
                            : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50"
                      }
                    >
                      {product.stock < product.reorderLevel * 0.5
                        ? "Stock Crítico"
                        : product.stock < product.reorderLevel
                          ? "Stock Bajo"
                          : "En Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(product)}>Ver detalles</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAdjustStock(product)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Ajustar Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewHistory(product)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Historial
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => onDelete(product)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </>
  )
}

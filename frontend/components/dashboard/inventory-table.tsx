"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Loader2 } from "lucide-react"
import type { InventoryItem } from "@/services/dashboard-service"

interface InventoryTableProps {
  inventory: InventoryItem[]
  isLoading: boolean
  onOrderProduct: (item: InventoryItem) => void
}

export function InventoryTable({ inventory, isLoading, onOrderProduct }: InventoryTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <Package className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No hay productos en stock crítico</h3>
        <p className="text-sm text-muted-foreground">Todos los productos tienen niveles de stock adecuados.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Stock Actual</TableHead>
          <TableHead>Nivel Mínimo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inventory.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>{item.currentStock}</TableCell>
            <TableCell>{item.reorderLevel}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  item.status === "critical"
                    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50"
                    : item.status === "low"
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50"
                      : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50"
                }
              >
                {item.status === "critical" ? "Crítico" : item.status === "low" ? "Bajo" : "Normal"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onOrderProduct(item)}>
                <Package className="h-4 w-4" />
                <span className="sr-only">Ordenar</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}


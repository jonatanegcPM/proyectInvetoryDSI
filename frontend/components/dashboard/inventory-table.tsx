"use client"

import { Package } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { InventoryItem } from "@/services/dashboard-service"

interface InventoryTableProps {
  inventory: InventoryItem[]
  isLoading: boolean
}

export function InventoryTable({ inventory, isLoading }: InventoryTableProps) {
  const router = useRouter()

  // Helper function to get badge properties based on stock levels
  const getBadgeProps = (item: InventoryItem) => {
    // Default values
    let className =
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50"
    let status = "En Stock"

    // Check stock levels against reorder level
    const reorderLevel = item.reorderLevel ?? 0
    const currentStock = item.currentStock ?? 0

    if (currentStock < reorderLevel * 0.5) {
      className = "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50"
      status = "Stock Crítico"
    } else if (currentStock < reorderLevel) {
      className =
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50"
      status = "Stock Bajo"
    }

    return { className, status }
  }

  // Function to navigate to suppliers page
  const navigateToSuppliers = () => {
    router.push("/suppliers")
  }

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
        <h3 className="text-lg font-medium">Inventario en buen estado</h3>
        <p className="text-sm text-muted-foreground">No hay productos con bajo stock.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Nivel de Reorden</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inventory.map((item) => {
          const { className, status } = getBadgeProps(item)
          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.currentStock}</TableCell>
              <TableCell>{item.reorderLevel}</TableCell>
              <TableCell>
                <Badge variant="outline" className={className}>
                  {status} ({item.currentStock})
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={navigateToSuppliers}>
                  Ordenar
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

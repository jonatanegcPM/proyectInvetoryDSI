"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"
import type { InventoryItem } from "@/types/dashboard"

interface InventoryTableProps {
  inventory: InventoryItem[]
  onOrderProduct: (item: InventoryItem) => void
}

export function InventoryTable({ inventory, onOrderProduct }: InventoryTableProps) {
  if (inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <Package className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No hay productos</h3>
        <p className="text-sm text-muted-foreground">No se encontraron productos con los filtros actuales.</p>
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
            <TableCell>{item.minStock}</TableCell>
            <TableCell>
              <Badge
                variant={item.status === "critical" ? "destructive" : item.status === "low" ? "warning" : "success"}
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


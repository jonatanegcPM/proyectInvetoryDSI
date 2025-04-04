"use client"

import { useState } from "react"
import type { InventoryItem } from "@/types/dashboard"

export function useInventoryDetails() {
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)

  // Función para ordenar productos
  const handleOrderProduct = (product: InventoryItem) => {
    setSelectedInventoryItem(product)
    setIsOrderDialogOpen(true)
  }

  return {
    selectedInventoryItem,
    setSelectedInventoryItem,
    isOrderDialogOpen,
    setIsOrderDialogOpen,
    handleOrderProduct,
  }
}


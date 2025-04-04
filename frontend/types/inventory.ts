export interface Product {
  id: number
  name: string
  sku: string
  barcode: string
  category: string
  description: string
  stock: number
  reorderLevel: number
  price: number
  costPrice: number
  supplier: string
  expiryDate: string
  location: string
  lastUpdated: string
  status: "in-stock" | "low-stock" | "medium-stock"
}

export interface InventoryTransaction {
  id: number
  date: string
  type: "Recepción" | "Venta" | "Ajuste" | "Devolución" | "Transferencia"
  product: string
  quantity: number
  user: string
  notes: string
}

export interface NewProduct {
  name: string
  sku: string
  barcode: string
  category: string
  description: string
  stock: number
  reorderLevel: number
  price: number
  costPrice: number
  supplier: string
  expiryDate: string
  location: string
}

export interface AdjustmentData {
  quantity: number
  type: "Recepción" | "Venta" | "Ajuste" | "Devolución" | "Transferencia"
  notes: string
}

export interface SortConfig {
  key: string | null
  direction: "ascending" | "descending"
}

export interface InventoryStats {
  totalProducts: number
  lowStockProducts: number
  totalValue: number
  expiringProducts: number
}


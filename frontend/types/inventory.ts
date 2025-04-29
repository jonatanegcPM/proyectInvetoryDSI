// Tipos para productos
export interface Product {
  id: number
  name: string
  sku: string | null
  barcode: string | null
  categoryId: number | null
  category: string | null
  description: string | null
  stock: number
  reorderLevel: number | null
  price: number
  costPrice: number | null
  supplierId: number | null
  supplier: string | null
  expiryDate: string | null
  location: string | null
  status: string
  createdAt: string
  lastUpdated: string
}

export interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export interface ProductsResponse {
  products: Product[]
  pagination: Pagination
}

// Tipos para transacciones de inventario
// Asegurémonos de que la interfaz InventoryTransaction tenga los nombres de propiedades correctos

export interface InventoryTransaction {
  id: number
  date: string
  type: string
  productId: number
  productName: string // Asegurarse de que sea productName, no product
  quantity: number
  notes: string | null
  userName: string // Asegurarse de que sea userName, no user
}

export interface InventoryTransactionResponse {
  transactions: InventoryTransaction[]
  pagination: Pagination
}

// Tipos para estadísticas de inventario
export interface InventoryStats {
  totalProducts: number
  lowStockProducts: number
  totalValue: number
  expiringProducts: number
}

// Tipos para crear y actualizar productos
export interface CreateProductDTO {
  name: string
  sku: string | null
  barcode: string | null
  categoryId: number | null
  description: string | null
  stock: number
  reorderLevel: number | null
  price: number
  costPrice: number | null
  supplierId: number | null
  expiryDate: string | null
  location: string | null
}

export interface UpdateProductDTO {
  name: string
  sku: string | null
  barcode: string | null
  categoryId: number | null
  description: string | null
  reorderLevel: number | null
  price: number
  costPrice: number | null
  supplierId: number | null
  expiryDate: string | null
  location: string | null
}

// Tipo para ajuste de stock
export interface AdjustmentData {
  quantity: number
  type: string
  notes: string
}

// Tipo para configuración de ordenamiento
export interface SortConfig {
  key: string
  direction: "ascending" | "descending"
}

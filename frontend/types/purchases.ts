// Tipos para pedidos (purchases)

// DTO para crear un pedido
export interface CreatePurchaseDTO {
  supplierId: number
  expectedDeliveryDate: string
  items: CreatePurchaseItemDTO[]
  notes?: string
}

// DTO para un item de pedido al crear
export interface CreatePurchaseItemDTO {
  productId: number
  quantity: number
  unitPrice: number
}

// DTO para un item de pedido
export interface PurchaseItemDTO {
  productId: number
  productName?: string
  quantity: number
  unitPrice: number
  total?: number
}

// DTO de respuesta para un item de pedido
export interface PurchaseItemResponseDTO {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

// DTO de respuesta para un pedido
export interface PurchaseResponseDTO {
  id: string
  purchaseDate: string
  expectedDeliveryDate?: string
  supplierId: number
  supplierName: string
  items: PurchaseItemResponseDTO[]
  subtotal: number
  tax: number
  total: number
  status: string
  notes?: string
}

// Respuesta paginada de pedidos
export interface PurchasesResponse {
  purchases: PurchaseResponseDTO[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Filtros para pedidos
export interface PurchaseFilters {
  status?: string
  startDate?: Date
  endDate?: Date
}

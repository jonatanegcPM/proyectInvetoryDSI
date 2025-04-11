import type { Product, Customer } from "@/services/pos-service"

// Interfaces para el punto de venta
export interface CartItem extends Product {
  quantity: number
}

export interface ProductScannerProps {
  isScanning: boolean
  scanMessage: string
  scanError: string
  toggleScanning: () => void
}

export interface ProductsTableProps {
  products: Product[]
  onAddToCart: (product: Product) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
  itemsPerPage: number
  totalItems: number
  startIndex: number
  endIndex: number
  isLoading: boolean
}

export interface ShoppingCartProps {
  cartItems: CartItem[]
  onUpdateQuantity: (productId: number, newQuantity: number) => void
  onRemoveFromCart: (productId: number) => void
  total: string
  selectedCustomer: Customer | null
  onCustomerSelect: (customerId: string) => void
  customers: Customer[]
  paymentMethod: string
  onPaymentMethodChange: (method: string) => void
  onCompleteSale: () => void
  isProcessing: boolean
}

export interface CustomerSelectorProps {
  selectedCustomer: Customer | null
  onCustomerSelect: (customerId: string) => void
  customers: Customer[]
}

export interface PaymentMethodSelectorProps {
  paymentMethod: string
  onPaymentMethodChange: (method: string) => void
}

// Define the SaleItem interface
export interface SaleItem {
  productId: number
  quantity: number
  price: number
}

// Actualizar la interfaz SaleRequest para incluir subtotal y tax
export interface SaleRequest {
  customerId: number
  items: SaleItem[]
  paymentMethod: string
  subtotal: number
  tax: number
  total: number
}
// Interfaces para el punto de venta
export interface Product {
  id: number
  name: string
  price: number
  category: string
  barcode: string
  stock?: number
}

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
}

export interface CartItem extends Product {
  quantity: number
}

export interface Sale {
  id: number
  customerId: number
  items: CartItem[]
  total: number
  paymentMethod: string
  date: Date
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


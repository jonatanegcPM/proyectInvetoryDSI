import type React from "react"

// Interfaces para los datos
export interface SupplierProduct {
  id: number
  name: string
  category: string
  stock: number
  price: number
}

export interface OrderItem {
  productId?: string
  productName: string
  quantity: number
  price: number
}

export interface SupplierOrder {
  id: string
  date: string
  expectedDate?: string
  items: number
  total: number
  status: string
  supplierName: string
  supplierId: number
  orderItems?: OrderItem[]
}

export interface Supplier {
  id: number
  name: string
  contact: string
  email: string
  phone: string
  address: string
  status: "active" | "inactive" | "pending"
  products: number
  lastOrder: string
  category: string
  rating: number
}

export interface SupplierStats {
  total: number
  active: number
  products: number
  lastOrderDate: string
}

export interface SupplierForm {
  name: string
  contact: string
  email: string
  phone: string
  address: string
  category: string
  status: "active" | "inactive" | "pending"
}

export interface SortConfig {
  key: string
  direction: "ascending" | "descending"
}

// Props para los componentes
export interface StatsCardsProps {
  stats: SupplierStats
}

export interface SearchAndFilterProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  categoryFilter: string
  onCategoryFilterChange: (value: string) => void
}

export interface SuppliersTableProps {
  suppliers: Supplier[]
  sortConfig: SortConfig
  onRequestSort: (key: string) => void
  onViewDetails: (supplier: Supplier) => void
  onEditSupplier: (supplier: Supplier) => void
  onDeleteSupplier: (supplier: Supplier) => void
  onNewOrder: (supplier: Supplier) => void
}

export interface OrdersTableProps {
  orders: SupplierOrder[]
  sortConfig: SortConfig
  onRequestSort: (key: string) => void
  onViewOrderDetails: (order: SupplierOrder) => void
}

export interface SupplierDetailsProps {
  supplier: Supplier | null
  products: SupplierProduct[]
  orders: SupplierOrder[]
  onNewOrder?: (supplier: Supplier) => void
}

export interface SupplierFormProps {
  form: SupplierForm
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSelectChange: (field: string, value: string) => void
  isProcessing: boolean
}

export interface AddSupplierDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  form: SupplierForm
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSelectChange: (field: string, value: string) => void
  onSubmit: () => void
  isProcessing: boolean
}

export interface EditSupplierDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  form: SupplierForm
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSelectChange: (field: string, value: string) => void
  onSubmit: () => void
  isProcessing: boolean
}

export interface DeleteSupplierDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier | null
  onConfirm: () => void
  isProcessing: boolean
}

export interface NewOrderDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier | null
  onSubmit: (orderData: any) => void
  isProcessing: boolean
}

export interface OrderDetailsDialogProps {
  order: SupplierOrder | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
  startIndex: number
  endIndex: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
}

export interface ExportMenuProps {
  onExport: (format: "csv" | "excel" | "pdf") => void
  isExporting: boolean
  disabled: boolean
}

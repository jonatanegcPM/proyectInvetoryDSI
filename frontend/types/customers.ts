import type React from "react"
// Interfaces para facilitar la integración con API
export interface CustomerPurchase {
  id: string
  date: string
  items: number
  total: number
  paymentMethod: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  dateOfBirth: string
  gender: string
  insurance: string
  status: "active" | "inactive"
  registrationDate: string
  lastVisit: string
  allergies: string[]
  notes: string
  totalPurchases: number
  totalSpent: number
  purchases: CustomerPurchase[]
}

export interface CustomerStats {
  total: number
  active: number
  inactive: number
  newThisMonth: number
  withInsurance: number
}

// Interfaz para el formulario de nuevo cliente
export interface CustomerForm {
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  status: string
  address: string
  insurance: string
  allergies: string
  notes: string
}

export interface SortConfig {
  key: string
  direction: "ascending" | "descending"
}

// Props para los componentes
export interface StatsCardsProps {
  stats: CustomerStats
}

export interface SearchAndFilterProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
}

export interface CustomersTableProps {
  customers: Customer[]
  sortConfig: SortConfig
  onRequestSort: (key: string) => void
  onViewDetails: (customer: Customer) => void
  onEditCustomer: (customer: Customer) => void
  onDeleteCustomer: (customer: Customer) => void
}

export interface CustomerDetailsProps {
  customer: Customer | null
}

// Añadir ValidationErrors a las interfaces existentes
export interface ValidationErrors {
  name?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  status?: string
}

// Modificar CustomerFormProps para incluir los errores de validación
export interface CustomerFormProps {
  form: CustomerForm
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSelectChange: (field: string, value: string) => void
  isProcessing: boolean
  validationErrors?: ValidationErrors
}

// Modificar AddCustomerDialogProps para incluir los errores de validación
export interface AddCustomerDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  form: CustomerForm
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSelectChange: (field: string, value: string) => void
  onSubmit: () => void
  isProcessing: boolean
  validationErrors?: ValidationErrors
  showTrigger?: boolean;
}

// Modificar EditCustomerDialogProps para incluir los errores de validación
export interface EditCustomerDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  form: CustomerForm
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSelectChange: (field: string, value: string) => void
  onSubmit: () => void
  isProcessing: boolean
  validationErrors?: ValidationErrors
}

export interface DeleteCustomerDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onConfirm: () => void
  isProcessing: boolean
}

export interface CustomerPurchasesProps {
  purchases: CustomerPurchase[]
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

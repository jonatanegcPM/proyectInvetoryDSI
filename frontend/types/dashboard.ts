import type React from "react"
// Interfaces para los datos del dashboard
export interface Transaction {
  id: string
  customer: string
  items: number
  amount: number
  status: "completed" | "pending" | "cancelled"
  date: string
}

export interface TransactionProduct {
  id: string
  name: string
  quantity: number
  unitPrice: number
  total: number
}

export interface TransactionDetails extends Transaction {
  products: TransactionProduct[]
  subtotal: number
  tax: number
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  currentStock: number
  minStock: number
  status: "critical" | "low" | "normal"
}

export interface StatsCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}

export interface DateFilterProps {
  dateFilter: "today" | "week" | "month" | "all"
  setDateFilter: (filter: "today" | "week" | "month" | "all") => void
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
  startIndex: number
  endIndex: number
}

export interface SearchBarProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  placeholder?: string
}

export interface QuickActionProps {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}


"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"

// Definir los tipos necesarios
interface SalesTrendData {
  date: string
  sales: number
  transactions: number
}

interface TopSellingProduct {
  id: string
  name: string
  quantity: number
  totalSales: number
}

// Importar los tipos y servicios necesarios
import {
  DashboardService,
  type DashboardStats,
  type Transaction,
  type TransactionDetails,
  type InventoryItem,
  type Pagination,
} from "@/services/dashboard-service"

export function useDashboardApi() {
  // Stats state
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsPagination, setTransactionsPagination] = useState<Pagination | null>(null)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)

  // Filtro de fecha compartido para stats y transacciones
  const [dateFilter, setDateFilter] = useState<"day" | "week" | "month" | "year" | "all">("week")

  // Low stock inventory state
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [isLoadingInventory, setIsLoadingInventory] = useState(true)

  // Transaction details state
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetails | null>(null)
  const [isLoadingTransactionDetails, setIsLoadingTransactionDetails] = useState(false)
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false)

  // Chart data states
  const [salesTrendData, setSalesTrendData] = useState<SalesTrendData[]>([])
  const [topSellingProducts, setTopSellingProducts] = useState<TopSellingProduct[]>([])
  const [isLoadingChartData, setIsLoadingChartData] = useState(true)

  // Search state
  const [searchTerm, setSearchTerm] = useState("")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard stats con filtro de fecha
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true)
    setError(null)
    try {
      const data = await DashboardService.getStats(dateFilter)
      setStats(data)
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
      setError("Failed to load dashboard statistics")
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      })
    } finally {
      setIsLoadingStats(false)
    }
  }, [dateFilter]) // Añadimos dateFilter como dependencia

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setIsLoadingTransactions(true)
    setError(null)
    try {
      // Siempre enviamos el filtro, incluso si es "all"
      const data = await DashboardService.getTransactions(dateFilter, currentPage, itemsPerPage)
      setTransactions(data.transactions || [])
      setTransactionsPagination(data.pagination)
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setError("Failed to load transactions")
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      })
      setTransactions([])
    } finally {
      setIsLoadingTransactions(false)
    }
  }, [dateFilter, currentPage, itemsPerPage])

  // Fetch low stock inventory
  const fetchLowStockItems = useCallback(async () => {
    setIsLoadingInventory(true)
    setError(null)
    try {
      const data = await DashboardService.getLowStockItems(5, "critical")
      setLowStockItems(data.lowStockProducts || [])
    } catch (err) {
      console.error("Error fetching low stock items:", err)
      setError("Failed to load inventory data")
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive",
      })
      setLowStockItems([])
    } finally {
      setIsLoadingInventory(false)
    }
  }, [])

  // Fetch chart data
  const fetchChartData = useCallback(async () => {
    setIsLoadingChartData(true)
    setError(null)

    // Obtener datos para el gráfico de tendencia de ventas
    try {
      const salesTrend = await DashboardService.getSalesTrend(dateFilter)
      setSalesTrendData(salesTrend || [])
    } catch (err) {
      console.error("Error fetching sales trend data:", err)
      setSalesTrendData([])
    }

    // Obtener datos para el gráfico de productos más vendidos
    try {
      const topProducts = await DashboardService.getTopSellingProducts(dateFilter, 5)
      setTopSellingProducts(topProducts || [])
    } catch (err) {
      console.error("Error fetching top selling products:", err)
      setTopSellingProducts([])
    }

    setIsLoadingChartData(false)
  }, [dateFilter])

  // Handle view transaction details
  const handleViewTransactionDetails = useCallback(async (transactionId: string) => {
    setIsLoadingTransactionDetails(true)
    setError(null)
    try {
      // Extraer solo el número del ID de la transacción (después del guion)
      const numericId = transactionId.split("-")[1]

      if (!numericId) {
        throw new Error("ID de transacción inválido")
      }

      const data = await DashboardService.getTransactionDetails(numericId)
      setSelectedTransaction(data)
      setIsTransactionDetailsOpen(true)
    } catch (err) {
      console.error("Error fetching transaction details:", err)
      setError("Failed to load transaction details")
      toast({
        title: "Error",
        description: "Failed to load transaction details",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTransactionDetails(false)
    }
  }, [])

  // Filter transactions by search term
  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Filter low stock items by search term
  const filteredLowStockItems = lowStockItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calcular elementos de inventario paginados basados en el término de búsqueda
  const paginatedLowStockItems = filteredLowStockItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // Función para cambiar el filtro de fecha y resetear la paginación
  const handleDateFilterChange = useCallback((filter: "day" | "week" | "month" | "year" | "all") => {
    setDateFilter(filter)
    setCurrentPage(1) // Resetear a la primera página cuando cambia el filtro
  }, [])

  // Load data on initial component mount
  useEffect(() => {
    fetchLowStockItems()
  }, [fetchLowStockItems])

  // Load stats, transactions and chart data when filter or pagination changes
  useEffect(() => {
    fetchStats()
    fetchTransactions()
    fetchChartData()
  }, [fetchStats, fetchTransactions, fetchChartData])

  return {
    // Data
    stats,
    transactions: filteredTransactions,
    transactionsPagination,
    lowStockItems: paginatedLowStockItems,
    selectedTransaction,
    salesTrendData,
    topSellingProducts,

    // Loading states
    isLoadingStats,
    isLoadingTransactions,
    isLoadingInventory,
    isLoadingTransactionDetails,
    isLoadingChartData,

    // UI states
    error,
    searchTerm,
    dateFilter,
    currentPage,
    itemsPerPage,
    isTransactionDetailsOpen,

    // Actions
    setSearchTerm,
    setDateFilter: handleDateFilterChange, // Usar la función que resetea la paginación
    setCurrentPage,
    setItemsPerPage,
    handleViewTransactionDetails,
    setIsTransactionDetailsOpen,

    // Refresh functions
    refreshStats: fetchStats,
    refreshTransactions: fetchTransactions,
    refreshLowStockItems: fetchLowStockItems,
    refreshChartData: fetchChartData,
  }
}


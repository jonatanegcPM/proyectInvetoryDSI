import { AuthService } from "./auth-service"

// Dashboard Stats Types
export interface DashboardStats {
  sales: {
    total: number
    change: number
    period: string
  }
  transactions: {
    count: number
    change: number
    period: string
  }
  customers: {
    count: number
    change: number
    period: string
  }
  inventory: {
    lowStock: number
  }
}

// Transaction Types
export interface Transaction {
  id: string
  customer: string
  items: number
  amount: number
  status: "completed" | "pending" | "cancelled"
  date: string
}

export interface TransactionDetails extends Transaction {
  products: TransactionProduct[]
  subtotal: number
  tax: number
}

export interface TransactionProduct {
  id: string
  name: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export interface TransactionsResponse {
  transactions: Transaction[]
  pagination: Pagination
}

// Inventory Types
export interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  currentStock: number
  reorderLevel: number
  criticalLevel: number
  status: "critical" | "low" | "normal"
}

export interface InventoryResponse {
  lowStockProducts: InventoryItem[]
  pagination: {
    total: number
    returned: number
    limit: number
  }
}

// Chart Data Types
export interface SalesTrendData {
  date: string
  sales: number
  transactions: number
}

export interface TopSellingProduct {
  id: string
  name: string
  quantity: number
  totalSales: number
}

export interface TopSellingResponse {
  products: TopSellingProduct[]
}

// Base API URL (should come from environment variable)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

/**
 * Service for dashboard-related API calls
 */
export const DashboardService = {
  /**
   * Get dashboard stats with date filter
   */
  async getStats(dateFilter: "day" | "week" | "month" | "year" | "all" = "week"): Promise<DashboardStats> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const url = new URL(`${API_URL}/dashboard/stats`)

      // Añadir el filtro de fecha a la URL
      url.searchParams.append("dateFilter", dateFilter)

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching dashboard stats: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error in getStats:", error)
      throw error
    }
  },

  /**
   * Get transactions with pagination and filtering
   */
  async getTransactions(
    dateFilter: "day" | "week" | "month" | "year" | "all" = "week",
    page = 1,
    limit = 10,
  ): Promise<TransactionsResponse> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const url = new URL(`${API_URL}/dashboard/transactions`)

      // Siempre añadimos el parámetro dateFilter
      url.searchParams.append("dateFilter", dateFilter)

      url.searchParams.append("page", page.toString())
      url.searchParams.append("limit", limit.toString())

      //console.log(`Fetching transactions with dateFilter=${dateFilter}, page=${page}, limit=${limit}`)

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching transactions: ${response.statusText}`)
      }

      const data = await response.json()
      //console.log(`Received ${data.transactions?.length || 0} transactions out of ${data.pagination?.total || 0} total`)

      return data
    } catch (error) {
      console.error("Error in getTransactions:", error)
      throw error
    }
  },

  /**
   * Get low stock inventory items
   */
  async getLowStockItems(limit = 5, threshold: "critical" | "low" = "critical"): Promise<InventoryResponse> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const url = new URL(`${API_URL}/dashboard/inventory/low-stock`)
      url.searchParams.append("limit", limit.toString())
      url.searchParams.append("threshold", threshold)

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching low stock items: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error in getLowStockItems:", error)
      throw error
    }
  },

  /**
   * Get transaction details by ID
   */
  async getTransactionDetails(id: string): Promise<TransactionDetails> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${API_URL}/dashboard/transaction/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching transaction details: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error in getTransactionDetails:", error)
      throw error
    }
  },

  /**
   * Get sales trend data for chart using transactions endpoint
   */
  async getSalesTrend(dateFilter: "day" | "week" | "month" | "year" | "all" = "week"): Promise<SalesTrendData[]> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const url = new URL(`${API_URL}/dashboard/transactions`)
      url.searchParams.append("dateFilter", dateFilter)
      url.searchParams.append("groupBy", "date")
      url.searchParams.append("limit", "100") // Obtener suficientes datos para el gráfico

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching sales trend data: ${response.statusText}`)
      }

      const data = await response.json()

      // Transformar los datos de transacciones al formato necesario para el gráfico
      // Esto dependerá de la estructura exacta que devuelva la API
      const trendData: SalesTrendData[] = []

      // Agrupar por fecha y calcular totales
      const groupedByDate = new Map<string, { sales: number; transactions: number }>()

      data.transactions.forEach((transaction: Transaction) => {
        const date = new Date(transaction.date)
        let dateKey = ""

        // Formatear la fecha según el filtro
        switch (dateFilter) {
          case "day":
            dateKey = `${date.getHours()}:00`
            break
          case "week":
            const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
            dateKey = days[date.getDay()]
            break
          case "month":
            dateKey = `${date.getDate()}`
            break
          case "year":
            const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
            dateKey = months[date.getMonth()]
            break
          default:
            dateKey = new Date(transaction.date).toLocaleDateString()
        }

        if (!groupedByDate.has(dateKey)) {
          groupedByDate.set(dateKey, { sales: 0, transactions: 0 })
        }

        const group = groupedByDate.get(dateKey)!
        group.sales += transaction.amount
        group.transactions += 1
      })

      // Convertir el mapa a un array para el gráfico
      groupedByDate.forEach((value, key) => {
        trendData.push({
          date: key,
          sales: value.sales,
          transactions: value.transactions,
        })
      })

      // Ordenar por fecha si es necesario
      return trendData
    } catch (error) {
      console.error("Error in getSalesTrend:", error)
      return []
    }
  },

  /**
   * Get top selling products
   */
  async getTopSellingProducts(
    dateFilter: "day" | "week" | "month" | "year" | "all" = "week",
    limit = 5,
  ): Promise<TopSellingProduct[]> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const url = new URL(`${API_URL}/dashboard/inventory/top-selling`)
      url.searchParams.append("dateFilter", dateFilter)
      url.searchParams.append("limit", limit.toString())

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching top selling products: ${response.statusText}`)
      }

      const data = await response.json()

      // Manejar la estructura correcta de la respuesta API
      if (data.topSellingProducts && Array.isArray(data.topSellingProducts)) {
        // Transformar la estructura de la API a la estructura que espera nuestro componente
        return data.topSellingProducts.map((product: any) => ({
          id: product.productId.toString(),
          name: product.name,
          quantity: product.totalSold,
          totalSales: product.totalRevenue,
        }))
      }

      // Si no hay datos o la estructura es incorrecta, devolver array vacío
      return []
    } catch (error) {
      console.error("Error in getTopSellingProducts:", error)
      return []
    }
  },
}


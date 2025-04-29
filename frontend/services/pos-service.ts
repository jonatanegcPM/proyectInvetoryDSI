import { AuthService } from "./auth-service"

// Tipos para los productos
export interface Product {
  id: number
  name: string
  sku: string | null
  barcode: string
  categoryId: number | null
  category: string | null
  description: string
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

export interface ProductsResponse {
  products: Product[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Tipos para los clientes
export interface Customer {
  id: number
  name: string
  email: string
  phone: string
}

export interface CustomersResponse {
  customers: Customer[]
}

// Tipos para las ventas
export interface SaleItem {
  productId: number
  quantity: number
}

export interface SaleRequest {
  customerId: number
  items: SaleItem[]
  paymentMethod: string
  total: number
}

export interface SaleItemResponse {
  productId: number
  name: string
  quantity: number
  price: number
  total: number
}

export interface SaleResponse {
  id: string
  date: string
  customerId: number
  customer: Customer
  items: SaleItemResponse[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
}

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

/**
 * Servicio para el punto de venta
 */
export const POSService = {
  /**
   * Obtener productos con paginación y búsqueda
   */
  async getProducts(search = "", page = 1, limit = 10): Promise<ProductsResponse> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const url = new URL(`${API_URL}/pos/products`)
      url.searchParams.append("search", search)
      url.searchParams.append("page", page.toString())
      url.searchParams.append("limit", limit.toString())
      // Add a parameter to filter out products with zero stock
      url.searchParams.append("inStock", "true")

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.statusText}`)
      }

      const data = await response.json()

      // Additional client-side filtering to ensure we only show products with stock > 0
      if (data.products) {
        data.products = data.products.filter((product) => product.stock > 0)
      }

      return data
    } catch (error) {
      console.error("Error in getProducts:", error)
      throw error
    }
  },

  /**
   * Obtener un producto por código de barras
   */
  async getProductByBarcode(barcode: string): Promise<{ product: Product }> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${API_URL}/pos/products/barcode/${barcode}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching product by barcode: ${response.statusText}`)
      }

      const data = await response.json()

      // Check if the product exists and has stock
      if (!data.product || data.product.stock <= 0) {
        throw new Error("Producto no disponible o sin existencias")
      }

      return data
    } catch (error) {
      console.error("Error in getProductByBarcode:", error)
      throw error
    }
  },

  /**
   * Obtener todos los clientes
   */
  async getCustomers(): Promise<CustomersResponse> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${API_URL}/pos/customers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching customers: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error in getCustomers:", error)
      throw error
    }
  },

  /**
   * Crear una nueva venta
   */
  async createSale(saleData: SaleRequest): Promise<SaleResponse> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      // Agregar log para depuración
      console.log("Datos de venta a enviar:", JSON.stringify(saleData, null, 2))

      const response = await fetch(`${API_URL}/pos/sales`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      })

      if (!response.ok) {
        // Intentar obtener más detalles del error
        let errorMessage = response.statusText
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
          console.error("Error detallado:", errorData)
        } catch (e) {
          // Si no podemos parsear el JSON, usamos el statusText
        }
        throw new Error(`Error creating sale: ${errorMessage}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error in createSale:", error)
      throw error
    }
  },
}

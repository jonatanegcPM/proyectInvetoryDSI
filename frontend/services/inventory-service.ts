import { AuthService } from "./auth-service"
import type {
  Product,
  ProductsResponse,
  InventoryTransactionResponse,
  InventoryStats,
  AdjustmentData,
  CreateProductDTO,
  UpdateProductDTO,
  Category,
  Supplier,
  SuppliersResponse,
} from "@/types/inventory"

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

/**
 * Servicio para comunicarse con la API de inventario
 */
export const InventoryService = {
  /**
   * Obtener productos con paginación, búsqueda y filtrado
   */
  async getProducts(
    search = "",
    categoryId: number | null = null,
    page = 1,
    limit = 10,
    sort = "name",
    direction = "asc",
  ): Promise<ProductsResponse> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const url = new URL(`${API_URL}/inventory/products`)

      // Añadir parámetros de consulta
      if (search) url.searchParams.append("search", search)
      if (categoryId) url.searchParams.append("categoryId", categoryId.toString())
      url.searchParams.append("page", page.toString())
      url.searchParams.append("limit", limit.toString())
      url.searchParams.append("sort", sort)
      url.searchParams.append("direction", direction)

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

      return await response.json()
    } catch (error) {
      console.error("Error in getProducts:", error)
      throw error
    }
  },

  /**
   * Obtener un producto por ID
   */
  async getProductById(id: number): Promise<Product> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${API_URL}/inventory/products/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching product: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error in getProductById for ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear un nuevo producto
   */
  async createProduct(product: CreateProductDTO): Promise<Product> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${API_URL}/inventory/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error creating product: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error in createProduct:", error)
      throw error
    }
  },

  /**
   * Actualizar un producto existente
   */
  async updateProduct(id: number, product: UpdateProductDTO): Promise<void> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${API_URL}/inventory/products/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error updating product: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Error in updateProduct for ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar un producto
   */
  async deleteProduct(id: number): Promise<void> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${API_URL}/inventory/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error deleting product: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Error in deleteProduct for ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Ajustar el stock de un producto
   */
  async adjustStock(id: number, adjustmentData: AdjustmentData): Promise<any> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${API_URL}/inventory/products/${id}/adjust`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: adjustmentData.quantity,
          type: adjustmentData.type,
          notes: adjustmentData.notes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error adjusting stock: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error in adjustStock for ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtener transacciones de inventario
   */
  async getTransactions(
    page = 1,
    limit = 10,
    productId: number | null = null,
    type: string | null = null,
    startDate: Date | null = null,
    endDate: Date | null = null,
  ): Promise<InventoryTransactionResponse> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const url = new URL(`${API_URL}/inventory/transactions`)

      // Añadir parámetros de consulta
      url.searchParams.append("page", page.toString())
      url.searchParams.append("limit", limit.toString())
      if (productId) url.searchParams.append("productId", productId.toString())
      if (type) url.searchParams.append("type", type)
      if (startDate) url.searchParams.append("startDate", startDate.toISOString())
      if (endDate) url.searchParams.append("endDate", endDate.toISOString())

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

      return await response.json()
    } catch (error) {
      console.error("Error in getTransactions:", error)
      throw error
    }
  },

  /**
   * Obtener categorías
   */
  async getCategories(): Promise<Category[]> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${API_URL}/inventory/categories`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching categories: ${response.statusText}`)
      }

      const data = await response.json()
      return data.categories || []
    } catch (error) {
      console.error("Error in getCategories:", error)
      throw error
    }
  },

  /**
   * Obtener proveedores
   */
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${API_URL}/suppliers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching suppliers: ${response.statusText}`)
      }

      const data = await response.json()
      return data.suppliers || []
    } catch (error) {
      console.error("Error in getSuppliers:", error)
      throw error
    }
  },

  /**
   * Obtener estadísticas de inventario
   */
  async getInventoryStats(): Promise<InventoryStats> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${API_URL}/inventory/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching inventory stats: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error in getInventoryStats:", error)
      throw error
    }
  },
}

// función getSuppliers para que use el token de autenticación
export async function getSuppliers(): Promise<SuppliersResponse> {
  try {
    const token = AuthService.getToken()
    if (!token) throw new Error("No authentication token")

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error al obtener proveedores: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error al obtener proveedores:", error)
    return { suppliers: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } }
  }
}

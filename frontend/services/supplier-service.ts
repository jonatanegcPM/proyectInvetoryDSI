import { AuthService } from "./auth-service"
import type {
  Supplier,
  SupplierForm,
  SupplierStats,
  SuppliersResponse,
  SupplierDetailResponse,
  SupplierProductsResponse,
  SupplierOrdersResponse,
  SupplierCategoriesResponse,
} from "@/types/suppliers"

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

/**
 * Servicio para comunicarse con la API de proveedores
 */
export const SupplierService = {
  /**
   * Obtener proveedores con paginación, búsqueda y filtrado
   */
  async getSuppliers(
    search = "",
    category: string | null = null,
    page = 1,
    limit = 10,
    sort = "name",
    direction = "asc",
  ): Promise<SuppliersResponse> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const url = new URL(`${API_URL}/suppliers`)

      // Añadir parámetros de consulta
      if (search) url.searchParams.append("search", search)
      if (category && category !== "Todos") url.searchParams.append("category", category)
      url.searchParams.append("page", page.toString())
      url.searchParams.append("limit", limit.toString())

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching suppliers: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error in getSuppliers:", error)
      throw error
    }
  },

  /**
   * Obtener un proveedor por ID con sus productos y pedidos
   */
  async getSupplierById(id: number): Promise<SupplierDetailResponse> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${API_URL}/suppliers/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching supplier: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error in getSupplierById for ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear un nuevo proveedor
   */
  async createSupplier(supplierData: SupplierForm): Promise<Supplier> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${API_URL}/suppliers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supplierData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error creating supplier: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error in createSupplier:", error)
      throw error
    }
  },

  /**
   * Actualizar un proveedor existente
   */
  async updateSupplier(id: number, supplierData: SupplierForm): Promise<Supplier> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${API_URL}/suppliers/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supplierData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error updating supplier: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error in updateSupplier for ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar un proveedor
   */
  async deleteSupplier(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${API_URL}/suppliers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error deleting supplier: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error in deleteSupplier for ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtener productos de un proveedor
   */
  async getSupplierProducts(id: number, page = 1, limit = 50, search = ""): Promise<SupplierProductsResponse> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const url = new URL(`${API_URL}/suppliers/${id}/products`)
      url.searchParams.append("page", page.toString())
      url.searchParams.append("limit", limit.toString())
      if (search) url.searchParams.append("search", search)

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching supplier products: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error in getSupplierProducts for ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtener pedidos de un proveedor
   */
  async getSupplierOrders(id: number, page = 1, limit = 10): Promise<SupplierOrdersResponse> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const url = new URL(`${API_URL}/suppliers/${id}/orders`)
      url.searchParams.append("page", page.toString())
      url.searchParams.append("limit", limit.toString())

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching supplier orders: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error in getSupplierOrders for ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtener categorías de proveedores
   */
  async getSupplierCategories(): Promise<string[]> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${API_URL}/suppliers/categories`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching supplier categories: ${response.statusText}`)
      }

      const data: SupplierCategoriesResponse = await response.json()
      return data.categories
    } catch (error) {
      console.error("Error in getSupplierCategories:", error)
      throw error
    }
  },

  /**
   * Obtener estadísticas de proveedores
   */
  async getSupplierStats(): Promise<SupplierStats> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`${API_URL}/suppliers/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching supplier stats: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error in getSupplierStats:", error)
      throw error
    }
  },
}

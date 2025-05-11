import { AuthService } from "./auth-service"
import type { CreatePurchaseDTO, PurchaseResponseDTO, PurchasesResponse, PurchaseFilters } from "@/types/purchases"

// Add this new interface at the top with the other interfaces
export interface UpdatePurchaseStatusDTO {
  status: string
}

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Constantes para mensajes de error
const ERROR_MESSAGES = {
  NO_AUTH: "No authentication token",
  NO_ITEMS: "Debe incluir al menos un producto en el pedido",
  INVALID_PRODUCT_ID: "Todos los productos deben tener un ID válido",
  INVALID_QUANTITY: "Todos los productos deben tener una cantidad válida",
  INVALID_PRICE: "Todos los productos deben tener un precio unitario válido",
  GENERIC_CREATE: "Error al crear el pedido",
  GENERIC_FETCH: "Error al obtener los pedidos",
  GENERIC_FETCH_DETAIL: "Error al obtener el detalle del pedido",
}

/**
 * Servicio para comunicarse con la API de pedidos (purchases)
 * Proporciona métodos para crear y obtener pedidos
 */
export const PurchaseService = {
  /**
   * Crear un nuevo pedido
   * @param purchaseData - Datos del pedido a crear
   * @returns Promise con la respuesta del pedido creado
   */
  async createPurchase(purchaseData: CreatePurchaseDTO): Promise<PurchaseResponseDTO> {
    try {
      // Verificar autenticación
      const token = AuthService.getToken()
      if (!token) throw new Error(ERROR_MESSAGES.NO_AUTH)

      // Convertir los datos al formato que espera el backend (camelCase)
      const formattedData = {
        supplierId: Number(purchaseData.supplierId),
        expectedDeliveryDate: purchaseData.expectedDeliveryDate,
        items: purchaseData.items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice) || 0,
        })),
        notes: purchaseData.notes || undefined,
      }

      // Validaciones de datos
      this.validatePurchaseData(formattedData)

      console.log("Enviando datos formateados:", JSON.stringify(formattedData, null, 2))

      // Realizar petición a la API
      const response = await fetch(`${API_URL}/purchases`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      })

      // Manejar errores de la API
      if (!response.ok) {
        await this.handleApiError(response, ERROR_MESSAGES.GENERIC_CREATE)
      }

      return await response.json()
    } catch (error: any) {
      console.error("Error in createPurchase:", error)
      throw error
    }
  },

  /**
   * Validar los datos del pedido
   * @param data - Datos del pedido formateados
   * @throws Error si los datos son inválidos
   */
  validatePurchaseData(data: any) {
    // Verificar que haya items
    if (!data.items || data.items.length === 0) {
      throw new Error(ERROR_MESSAGES.NO_ITEMS)
    }

    // Verificar cada item
    for (const item of data.items) {
      if (!item.productId || item.productId <= 0) {
        throw new Error(ERROR_MESSAGES.INVALID_PRODUCT_ID)
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(ERROR_MESSAGES.INVALID_QUANTITY)
      }
      if (item.unitPrice === null || item.unitPrice === undefined || isNaN(item.unitPrice)) {
        throw new Error(ERROR_MESSAGES.INVALID_PRICE)
      }
    }
  },

  /**
   * Manejar errores de la API de forma unificada
   * @param response - Respuesta de la API
   * @param defaultMessage - Mensaje de error predeterminado
   */
  async handleApiError(response: Response, defaultMessage: string) {
    let errorMessage = `${defaultMessage}: ${response.statusText}`
    try {
      const errorData = await response.json()
      console.log("Error API Response:", errorData)

      // Comprobar si hay errores de validación específicos
      if (errorData.errors) {
        const errorDetails = Object.entries(errorData.errors)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join("; ")

        errorMessage = `Error de validación: ${errorDetails}`
      } else {
        errorMessage = errorData.message || errorData.title || errorMessage
      }

      console.error("Error details:", errorData)
    } catch (e) {
      // Si no podemos parsear la respuesta como JSON, usamos el mensaje genérico
      console.error("Could not parse error response:", e)
    }
    throw new Error(errorMessage)
  },

  /**
   * Obtener todos los pedidos con paginación y filtros
   * @param page - Número de página
   * @param limit - Cantidad de elementos por página
   * @param filters - Filtros opcionales (estado, fecha)
   * @returns Promise con la respuesta paginada de pedidos
   */
  async getPurchases(page = 1, limit = 10, filters?: PurchaseFilters): Promise<PurchasesResponse> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error(ERROR_MESSAGES.NO_AUTH)

      const url = new URL(`${API_URL}/purchases`)

      // Añadir parámetros de consulta
      url.searchParams.append("page", page.toString())
      url.searchParams.append("limit", limit.toString())

      if (filters) {
        if (filters.status) url.searchParams.append("status", filters.status)
        if (filters.startDate) url.searchParams.append("startDate", filters.startDate.toISOString())
        if (filters.endDate) url.searchParams.append("endDate", filters.endDate.toISOString())
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        await this.handleApiError(response, ERROR_MESSAGES.GENERIC_FETCH)
      }

      return await response.json()
    } catch (error) {
      console.error("Error in getPurchases:", error)
      throw error
    }
  },

  /**
   * Obtener un pedido por ID
   * @param id - ID del pedido
   * @returns Promise con el detalle del pedido
   */
  async getPurchaseById(id: number): Promise<PurchaseResponseDTO> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error(ERROR_MESSAGES.NO_AUTH)

      const response = await fetch(`${API_URL}/purchases/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        await this.handleApiError(response, ERROR_MESSAGES.GENERIC_FETCH_DETAIL)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error in getPurchaseById for ID ${id}:`, error)
      throw error
    }
  },

  // Add this new method to the PurchaseService object
  /**
   * Actualizar el estado de un pedido
   * @param id - ID del pedido
   * @param status - Nuevo estado ("received" o "cancelled")
   * @returns Promise con la respuesta del pedido actualizado
   */
  async updatePurchaseStatus(id: number, status: string): Promise<PurchaseResponseDTO> {
    try {
      const token = AuthService.getToken()
      if (!token) throw new Error(ERROR_MESSAGES.NO_AUTH)

      // Validar que el estado sea válido
      if (status !== "received" && status !== "cancelled") {
        throw new Error("Estado no válido. Debe ser 'received' o 'cancelled'")
      }

      const response = await fetch(`${API_URL}/purchases/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        await this.handleApiError(response, `Error al actualizar el estado del pedido a ${status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error in updatePurchaseStatus for ID ${id}:`, error)
      throw error
    }
  },
}

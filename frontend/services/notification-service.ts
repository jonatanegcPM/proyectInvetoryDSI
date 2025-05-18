import type { Notification } from "@/components/notifications/notification-provider"
import { getAuthToken } from "@/services/auth-service" // Asumiendo que existe este método

// Tipos para las respuestas de la API
interface NotificationsResponse {
  notifications: ApiNotification[]
  totalCount: number
  page: number
  totalPages: number
}

interface ApiNotification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  createdAt: string
  read: boolean
  category?: string
  entityId?: string
  entityType?: string
}

interface MarkAsReadResponse {
  success: boolean
  notification: {
    id: string
    read: boolean
  }
}

interface MarkAllAsReadResponse {
  success: boolean
  count: number
}

interface DeleteNotificationResponse {
  id: string
  success: boolean
}

interface UnreadCountResponse {
  count: number
}

// Clase de servicio para manejar las notificaciones
export class NotificationService {
  // Base URL para todas las peticiones
  private static getApiUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
    // Evitar duplicación de "/api" en la URL
    return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`
  }

  // Obtener los headers de autenticación
  private static async getAuthHeaders(): Promise<HeadersInit> {
    const token = await getAuthToken()
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  // Obtener notificaciones con filtros opcionales
  static async getNotifications(
    page = 1,
    limit = 20,
    filter: "all" | "unread" | "read" = "all",
    category?: string,
  ): Promise<NotificationsResponse> {
    try {
      let url = `${this.getApiUrl()}/notifications?page=${page}&limit=${limit}&filter=${filter}`
      if (category) {
        url += `&category=${category}`
      }

      const headers = await this.getAuthHeaders()
      const response = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include", // Incluir cookies para autenticación adicional si es necesario
      })

      if (!response.ok) {
        throw new Error(`Error fetching notifications: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
      throw error
    }
  }

  // Marcar una notificación como leída
  static async markAsRead(id: string): Promise<MarkAsReadResponse> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.getApiUrl()}/notifications/${id}/read`, {
        method: "PATCH",
        headers,
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Error marking notification as read: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error)
      throw error
    }
  }

  // Marcar todas las notificaciones como leídas
  static async markAllAsRead(): Promise<MarkAllAsReadResponse> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.getApiUrl()}/notifications/read-all`, {
        method: "PATCH",
        headers,
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Error marking all notifications as read: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
      throw error
    }
  }

  // Eliminar una notificación
  static async deleteNotification(id: string): Promise<DeleteNotificationResponse> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.getApiUrl()}/notifications/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Error deleting notification: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Failed to delete notification ${id}:`, error)
      throw error
    }
  }

  // Obtener el conteo de notificaciones no leídas
  static async getUnreadCount(): Promise<number> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.getApiUrl()}/notifications/unread-count`, {
        method: "GET",
        headers,
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Error fetching unread count: ${response.statusText}`)
      }

      const data: UnreadCountResponse = await response.json()
      return data.count
    } catch (error) {
      console.error("Failed to fetch unread count:", error)
      throw error
    }
  }

  // Convertir una notificación de la API al formato interno
  static mapApiNotificationToInternal(apiNotification: ApiNotification): Notification {
    return {
      id: apiNotification.id,
      title: apiNotification.title,
      message: apiNotification.message,
      type: apiNotification.type,
      timestamp: new Date(apiNotification.createdAt),
      read: apiNotification.read,
      category: apiNotification.category,
      entityId: apiNotification.entityId,
      entityType: apiNotification.entityType,
    }
  }
}

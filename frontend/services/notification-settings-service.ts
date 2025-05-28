import { getAuthToken } from "@/services/auth-service"

export interface NotificationSettings {
  lowStockAlerts: boolean
  expirationAlerts: boolean
  expiredProductAlerts: boolean
  editAlerts: boolean
  stockAdjustmentAlerts: boolean
  salesAlerts: boolean
}

export class NotificationSettingsService {
  private static getApiUrl(): string {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}`
  }

  private static async getAuthHeaders(): Promise<HeadersInit> {
    const token = await getAuthToken()
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  // Obtener configuración actual
  static async getSettings(): Promise<NotificationSettings> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.getApiUrl()}/notifications/settings`, {
        method: "GET",
        headers,
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Error fetching notification settings: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to fetch notification settings:", error)
      throw error
    }
  }

  // Actualizar configuración
  static async updateSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.getApiUrl()}/notifications/settings`, {
        method: "PUT",
        headers,
        body: JSON.stringify(settings),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Error updating notification settings: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to update notification settings:", error)
      throw error
    }
  }
}

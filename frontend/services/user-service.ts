import { AuthService } from "./auth-service"
import { toast } from "@/hooks/use-toast"

// Define types for user data
export interface UserData {
  userID: number
  name: string
  username: string
  password?: string
  roleID: number
  email: string
  createdAt: string
  isActive: boolean
  role?: {
    roleID: number
    roleName: string
    description: string
    isActive: boolean
  }
}

// Define types for profile update
export interface ProfileUpdateData {
  userId: number
  Name: string
  Username: string
  Email: string
  Password?: string
}

// Define types for password update
export interface PasswordUpdateData {
  newPassword: string
  confirmPassword?: string
}

// URL base de la API (debe configurarse en variables de entorno)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Determinar si estamos en modo simulado (sin API real)
const IS_MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true" || false

/**
 * Servicio para manejar operaciones relacionadas con el usuario
 */
export const UserService = {
  /**
   * Obtener los datos del usuario actual
   */
  async getCurrentUser(): Promise<UserData | null> {
    try {
      const token = AuthService.getToken()
      if (!token) {
        throw new Error("No hay sesión activa")
      }

      const user = AuthService.getUser()
      if (!user || !user.id) {
        throw new Error("No se pudo obtener el ID del usuario")
      }

      const userId = user.id
      const headers = await AuthService.getAuthHeaders()

      const response = await fetch(`${API_URL}/User/${userId}`, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al obtener datos del usuario")
      }

      return await response.json()
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al obtener datos del usuario",
        variant: "destructive",
      })
      return null
    }
  },

  /**
   * Actualizar el perfil del usuario
   */
  async updateProfile(data: ProfileUpdateData): Promise<UserData | null> {
    try {
      const token = AuthService.getToken()
      if (!token) {
        throw new Error("No hay sesión activa")
      }

      const headers = await AuthService.getAuthHeaders()

      const response = await fetch(`${API_URL}/User/${data.userId}`, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar el perfil")
      }

      return await response.json()
    } catch (error) {
      console.error("Error al actualizar el perfil:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el perfil",
        variant: "destructive",
      })
      return null
    }
  },

  /**
   * Actualizar la contraseña del usuario
   */
  async updatePassword(userId: number, newPassword: string): Promise<UserData | null> {
    try {
      const token = AuthService.getToken()
      if (!token) {
        throw new Error("No hay sesión activa")
      }

      // Para actualizar la contraseña, usamos el mismo endpoint de actualización de perfil
      // pero solo enviamos los campos necesarios
      const headers = await AuthService.getAuthHeaders()

      const response = await fetch(`${API_URL}/User/${userId}`, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          Password: newPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar la contraseña")
      }

      return await response.json()
    } catch (error) {
      console.error("Error al actualizar la contraseña:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la contraseña",
        variant: "destructive",
      })
      return null
    }
  },
}

import { AuthService } from "./auth-service"

// Define types for profile update
export interface ProfileUpdateData {
  name?: string
  email?: string
  phone?: string
  position?: string
}

// Define types for password update
export interface PasswordUpdateData {
  currentPassword: string
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
   * Actualizar el perfil del usuario
   */
  async updateProfile(data: ProfileUpdateData): Promise<any> {
    // Si estamos en modo simulado, usar actualización simulada
    if (IS_MOCK_MODE) {
      return this._mockUpdateProfile(data)
    }

    // Modo API real
    try {
      const token = AuthService.getToken()
      if (!token) {
        throw new Error("No hay sesión activa")
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      throw error
    }
  },

  /**
   * Versión simulada de la actualización de perfil para desarrollo
   */
  async _mockUpdateProfile(data: ProfileUpdateData): Promise<any> {
    // Simular latencia de red
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Obtener usuario actual
    const currentUser = AuthService.getUser()
    if (!currentUser) {
      throw new Error("No hay usuario activo")
    }

    // Actualizar datos en localStorage
    const updatedUser = {
      ...currentUser,
      ...data,
    }

    // Guardar en localStorage
    localStorage.setItem("user", JSON.stringify(updatedUser))

    return { success: true, user: updatedUser }
  },

  /**
   * Actualizar la contraseña del usuario
   */
  async updatePassword(data: PasswordUpdateData): Promise<any> {
    // Si estamos en modo simulado, usar actualización simulada
    if (IS_MOCK_MODE) {
      return this._mockUpdatePassword(data)
    }

    // Modo API real
    try {
      const token = AuthService.getToken()
      if (!token) {
        throw new Error("No hay sesión activa")
      }

      const response = await fetch(`${API_URL}/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar la contraseña")
      }

      return await response.json()
    } catch (error) {
      console.error("Error al actualizar la contraseña:", error)
      throw error
    }
  },

  /**
   * Versión simulada de la actualización de contraseña para desarrollo
   */
  async _mockUpdatePassword(data: PasswordUpdateData): Promise<any> {
    // Simular latencia de red
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Verificar contraseña actual (en un entorno real esto se haría en el servidor)
    if (data.currentPassword !== "password123") {
      throw new Error("La contraseña actual es incorrecta")
    }

    // En un entorno real, la contraseña se actualizaría en la base de datos
    return { success: true }
  },
}

// Tipos para la autenticación
export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: number | string
    name: string
    email: string
    role: number | string
  }
}

// Actualizar la interfaz ValidateResponse para incluir roleName
export interface ValidateResponse {
  valid: boolean
  user: {
    id: string
    name: string
    email: string
    role: string
    roleName: string // Añadimos el campo roleName
  }
}

export interface AuthError {
  message: string
  errors?: Record<string, string[]>
}

// URL base de la API (debe configurarse en variables de entorno)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Actualizar el objeto de credenciales de prueba para incluir roleName
const TEST_CREDENTIALS = {
  email: "admin@farmacia.com",
  password: "password123",
  user: {
    id: "1",
    name: "Administrador",
    email: "admin@farmacia.com",
    role: "1",
    roleName: "Administrador", // Añadimos el roleName
  },
}

// Determinar si estamos en modo simulado (sin API real)
// Get mock mode from environment or configuration
const IS_MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true" || false

/**
 * Servicio de autenticación para manejar login, logout y verificación de tokens
 */
export const AuthService = {
  /**
   * Iniciar sesión con email y contraseña
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Si estamos en modo simulado, usar autenticación simulada
    if (IS_MOCK_MODE) {
      return this._mockLogin(credentials)
    }

    // Modo API real
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData: AuthError = await response.json()
        throw new Error(errorData.message || "Error de autenticación")
      }

      const data: AuthResponse = await response.json()

      // Guardar token en localStorage
      this.setToken(data.token)
      this.setUser(data.user)

      return data
    } catch (error) {
      console.error("Error de login:", error)
      throw error
    }
  },

  /**
   * Versión simulada del login para desarrollo
   */
  async _mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simular latencia de red
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Verificar credenciales de prueba
    if (credentials.email === TEST_CREDENTIALS.email && credentials.password === TEST_CREDENTIALS.password) {
      // Generar un token simulado
      const mockToken = `mock_${Math.random().toString(36).substring(2)}`
      const response: AuthResponse = {
        token: mockToken,
        user: TEST_CREDENTIALS.user,
      }

      // Guardar en localStorage
      this.setToken(response.token)
      this.setUser(response.user)

      return response
    } else {
      throw new Error("Credenciales incorrectas. Intente con admin@farmacia.com / password123")
    }
  },

  /**
   * Cerrar sesión y eliminar token
   */
  logout(): void {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
    localStorage.removeItem("isAuthenticated")
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token // Devuelve true si hay un token
  },

  /**
   * Obtener el token de autenticación
   */
  getToken(): string | null {
    // Corregir para obtener el token correcto
    return localStorage.getItem("auth_token")
  },

  /**
   * Guardar el token de autenticación
   */
  setToken(token: string): void {
    localStorage.setItem("auth_token", token)
    localStorage.setItem("isAuthenticated", "true")
  },

  /**
   * Guardar información del usuario
   */
  setUser(user: AuthResponse["user"]): void {
    localStorage.setItem("user", JSON.stringify(user))
  },

  /**
   * Obtener información del usuario
   */
  getUser(): AuthResponse["user"] | null {
    const userStr = localStorage.getItem("user")
    if (!userStr) return null

    try {
      return JSON.parse(userStr)
    } catch (error) {
      console.error("Error al parsear datos de usuario:", error)
      return null
    }
  },

  /**
   * Verificar si el token es válido
   */
  async validateToken(): Promise<ValidateResponse | null> {
    const token = this.getToken()
    if (!token) return null

    // En modo simulado, consideramos válido cualquier token que empiece con "mock_"
    if (IS_MOCK_MODE) {
      if (token.startsWith("mock_")) {
        return {
          valid: true,
          user: TEST_CREDENTIALS.user,
        }
      }
      return null
    }

    // Modo API real
    try {
      const response = await fetch(`${API_URL}/auth/validate`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch (error) {
      console.error("Error al validar token:", error)
      return null
    }
  },
}

/**
 * Obtiene el token de autenticación actual
 * @returns El token JWT o null si no hay sesión activa
 */
export async function getAuthToken(): Promise<string | null> {
  // Implementación depende de cómo almacenas el token
  // Ejemplo usando localStorage:
  return localStorage.getItem("auth_token")

  // O si usas una cookie:
  // return document.cookie.replace(/(?:(?:^|.*;\s*)authToken\s*\=\s*([^;]*).*$)|^.*$/, "$1")

  // O si tienes un método más complejo que incluye refreshing:
  // const tokenData = JSON.parse(localStorage.getItem('tokenData') || '{}')
  // if (tokenData.expiresAt && new Date(tokenData.expiresAt) < new Date()) {
  //   return await refreshToken()
  // }
  // return tokenData.token || null
}

/**
 * Refresca el token de autenticación si es necesario
 * @returns Un nuevo token válido
 */
export async function refreshToken(): Promise<string | null> {
  // Implementación del refresh token
  // ...
  return null
}

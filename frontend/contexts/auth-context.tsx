"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { AuthService, type LoginCredentials } from "@/services/auth-service"

// Tipos para el contexto de autenticación
interface User {
  id: string | number
  name: string
  email: string
  role: string | number
  roleName?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: User }>
  logout: () => void
}

// Determinar si estamos en modo simulado
// Get mock mode from environment or configuration
const IS_MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true" || false

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  // Verificar autenticación al cargar la página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true) // Asegurarse de que isLoading sea true mientras verificamos

        // Verificar si hay un token válido
        const validationResult = await AuthService.validateToken()

        if (validationResult && validationResult.valid) {
          setUser(validationResult.user)
          setIsAuthenticated(true)

          // Asegurarse de que el token está disponible para comandos
          if (typeof window !== "undefined" && AuthService.getToken()) {
            localStorage.setItem("token", AuthService.getToken() || "")
          }
        } else {
          // Si el token no es válido, limpiar la autenticación
          AuthService.logout()
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        // En caso de error, limpiar la autenticación
        AuthService.logout()
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Mostrar mensaje de modo simulado en desarrollo
    if (IS_MOCK_MODE) {
      console.info("🔑 Autenticación en modo simulado. Use admin@farmacia.com / password123")
    }
  }, [])

  // Función de login
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User }> => {
    setIsLoading(true)
    try {
      // Usar el servicio de autenticación para iniciar sesión
      const response = await AuthService.login(credentials)

      // Actualizar estado
      setUser(response.user)
      setIsAuthenticated(true)

      // Asegurarse de que el token está disponible para comandos
      if (typeof window !== "undefined" && AuthService.getToken()) {
        localStorage.setItem("token", AuthService.getToken() || "")
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${response.user.name}`,
      })

      return { success: true, user: response.user }
    } catch (error) {
      toast({
        title: "Error de autenticación",
        description: error instanceof Error ? error.message : "Error al iniciar sesión",
        variant: "destructive",
      })
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }

  // Función de logout
  const logout = () => {
    AuthService.logout()
    if (typeof window !== "undefined") {
      localStorage.removeItem("token") // Eliminar también el token de compatibilidad
    }
    setUser(null)
    setIsAuthenticated(false)
    router.push("/login")
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    })
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>{children}</AuthContext.Provider>
  )
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

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
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
}

// Determinar si estamos en modo simulado
const IS_MOCK_MODE = !process.env.NEXT_PUBLIC_API_URL

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
        // Verificar si hay un token válido
        const validationResult = await AuthService.validateToken()

        if (validationResult && validationResult.valid) {
          setUser(validationResult.user)
          setIsAuthenticated(true)
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
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Usar el servicio de autenticación para iniciar sesión
      const response = await AuthService.login(credentials)

      // Actualizar estado
      setUser(response.user)
      setIsAuthenticated(true)

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${response.user.name}`,
      })

      return true
    } catch (error) {
      toast({
        title: "Error de autenticación",
        description: error instanceof Error ? error.message : "Error al iniciar sesión",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Función de logout
  const logout = () => {
    AuthService.logout()
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


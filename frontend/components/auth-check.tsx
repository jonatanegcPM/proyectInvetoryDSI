"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Si no está en la página de login o forgot-password y no está autenticado, redirigir
    if (!isLoading && !isAuthenticated && pathname !== "/login" && pathname !== "/forgot-password") {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Mientras verifica, muestra un indicador de carga
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Si está en páginas de autenticación y ya está autenticado, redirigir al dashboard
  if (isAuthenticated && (pathname === "/login" || pathname === "/forgot-password")) {
    router.push("/")
    return null
  }

  // Si está en páginas protegidas y no está autenticado, el useEffect se encargará de redirigir
  // Si está en páginas de autenticación y no está autenticado, mostrar el contenido
  // Si está autenticado y en páginas protegidas, mostrar el contenido
  return <>{children}</>
}


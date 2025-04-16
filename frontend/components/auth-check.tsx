"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuth()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Si no está cargando y no está autenticado y no está en páginas de autenticación, redirigir
    if (!isLoading) {
      if (!isAuthenticated && pathname !== "/login" && pathname !== "/forgot-password") {
        router.push("/login")
      } else if (isAuthenticated && (pathname === "/login" || pathname === "/forgot-password")) {
        router.push("/")
      } else {
        // Solo renderizar el contenido si está autenticado o está en páginas de autenticación
        setShouldRender(true)
      }
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Mientras verifica, muestra un indicador de carga
  if (isLoading || !shouldRender) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Solo renderizar el contenido si debemos hacerlo
  return <>{children}</>
}

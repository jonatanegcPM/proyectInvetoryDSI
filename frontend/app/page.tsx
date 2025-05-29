"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import Dashboard from "@/components/dashboard"
import Layout from "@/components/layout"
import { AuthCheck } from "@/components/auth-check"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si no está cargando y no está autenticado, redirigir a landing
    if (!isLoading && !isAuthenticated) {
      router.push("/landing")
    }
  }, [isAuthenticated, isLoading, router])

  // Mientras carga, mostrar spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Si no está autenticado, no renderizar nada (se redirigirá)
  if (!isAuthenticated) {
    return null
  }

  // Si está autenticado, mostrar el dashboard
  return (
    <AuthCheck>
      <Layout>
        <Dashboard />
      </Layout>
    </AuthCheck>
  )
}

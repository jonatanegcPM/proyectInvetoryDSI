"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Loader2, AlertCircle, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

// Determinar si estamos en modo simulado
const IS_MOCK_MODE = !process.env.NEXT_PUBLIC_API_URL

export default function Login() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState(IS_MOCK_MODE ? "admin@farmacia.com" : "")
  const [password, setPassword] = useState(IS_MOCK_MODE ? "password123" : "")
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Usar el método login del contexto de autenticación
      const success = await login({ email, password })

      if (success) {
        // Si el login es exitoso, redirigir al dashboard
        router.push("/")
      } else {
        setError(
          IS_MOCK_MODE
            ? "Credenciales incorrectas. Intente con admin@farmacia.com / password123"
            : "Credenciales incorrectas. Verifique su email y contraseña.",
        )
      }
    } catch (err) {
      setError("Ocurrió un error al intentar iniciar sesión")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-48 h-24">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/farmacias-brasil-logo-nIHq3euBsjEKmdPQwIz2t0dl0DEKC5.webp"
                alt="Farmacias Brasil Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <CardDescription className="text-[#003399]">Sistema de Punto de Venta</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {IS_MOCK_MODE && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Modo Simulado</AlertTitle>
              <AlertDescription>
                El sistema está en modo simulado. Use las credenciales predeterminadas para iniciar sesión.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="correo@farmaciasbrasil.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(checked === true)}
                  disabled={isSubmitting}
                />
                <label htmlFor="remember" className="text-sm font-medium cursor-pointer">
                  Recordarme
                </label>
              </div>

              <Link href="/forgot-password" className="text-sm font-medium text-[#003399] hover:underline">
                ¿Olvidó su contraseña?
              </Link>
            </div>

            <Button type="submit" className="w-full bg-[#003399] hover:bg-[#002266]" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          {IS_MOCK_MODE ? (
            <p className="w-full">Credenciales: admin@farmacia.com / password123</p>
          ) : (
            <p className="w-full">© {new Date().getFullYear()} Farmacias Brasil. Todos los derechos reservados.</p>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}


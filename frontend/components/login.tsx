"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Loader2, AlertCircle, Info, Lock, Mail, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

// Determinar si estamos en modo simulado
// Get mock mode from environment or configuration
const IS_MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true" || false

export default function Login() {
  const router = useRouter()
  const { login } = useAuth()
  const { theme } = useTheme()
  const [email, setEmail] = useState(IS_MOCK_MODE ? "admin@farmacia.com" : "")
  const [password, setPassword] = useState(IS_MOCK_MODE ? "password123" : "")
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [animateForm, setAnimateForm] = useState(false)
  const [animateLogo, setAnimateLogo] = useState(false)
  const [animateTitle, setAnimateTitle] = useState(false)
  const [animateInputs, setAnimateInputs] = useState(false)
  const [animateButton, setAnimateButton] = useState(false)

  const backgroundImages = ["/images/pharmacy-counter.jpg", "/images/pharmacist-tablet.png"]

  // Rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      // If user prefers reduced motion, skip animations
      setAnimationComplete(true)
      setAnimateLogo(true)
      setAnimateTitle(true)
      setAnimateForm(true)
      setAnimateInputs(true)
      setAnimateButton(true)
      return
    }

    // Staggered animations
    const timeout1 = setTimeout(() => setAnimateLogo(true), 100)
    const timeout2 = setTimeout(() => setAnimateTitle(true), 300)
    const timeout3 = setTimeout(() => setAnimateForm(true), 500)
    const timeout4 = setTimeout(() => setAnimateInputs(true), 700)
    const timeout5 = setTimeout(() => setAnimateButton(true), 900)
    const timeout6 = setTimeout(() => setAnimationComplete(true), 1200)

    return () => {
      clearTimeout(timeout1)
      clearTimeout(timeout2)
      clearTimeout(timeout3)
      clearTimeout(timeout4)
      clearTimeout(timeout5)
      clearTimeout(timeout6)
    }
  }, [])

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
    <div className="min-h-screen flex items-center justify-center p-0 overflow-hidden">
      {/* Background with overlay */}
      <div className="fixed inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-green-500/30 dark:from-blue-900/40 dark:to-green-800/50 z-10"></div>
        <Image
          src={backgroundImages[currentImageIndex] || "/placeholder.svg"}
          alt="Pharmacy Background"
          fill
          className="object-cover transition-opacity duration-1000"
          priority
        />
      </div>

      {/* Login container */}
      <div className="flex flex-col md:flex-row w-full max-w-5xl h-[600px] relative z-20 m-4">
        {/* Left panel - Branding */}
        <div className="hidden md:flex flex-col justify-between w-2/5 bg-gradient-to-br from-blue-600 to-green-500 dark:from-blue-800 dark:to-green-700 p-8 rounded-l-2xl text-white">
          <div>
            <div
              className={cn(
                "relative w-48 h-48 mx-auto mb-6",
                "transition-all duration-700 ease-out",
                animateLogo ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
              )}
            >
              <Image
                src="/images/farmacias-brasil-logo-green.png"
                alt="Farmacias Brasil Logo"
                fill
                className="object-contain"
              />
            </div>
            <h1
              className={cn(
                "text-3xl font-bold mb-4",
                "transition-all duration-700 delay-100 ease-out",
                animateTitle ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
            >
              Farmacias Brasil
            </h1>
            <p
              className={cn(
                "text-lg opacity-90",
                "transition-all duration-700 delay-200 ease-out",
                animateTitle ? "opacity-90 translate-y-0" : "opacity-0 translate-y-4",
              )}
            >
              Sistema de gestión integral para farmacias
            </p>
          </div>

          <div
            className={cn(
              "space-y-4",
              "transition-all duration-700 delay-300 ease-out",
              animateTitle ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <p>Acceso seguro y encriptado</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-pill"
                >
                  <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                  <path d="m8.5 8.5 7 7" />
                </svg>
              </div>
              <p>Gestión de inventario farmacéutico</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-users"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p>Administración de clientes y proveedores</p>
            </div>
          </div>

          <div className="text-sm opacity-80">© {new Date().getFullYear()} Farmacias Brasil</div>
        </div>

        {/* Right panel - Login form */}
        <div className="w-full md:w-3/5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-8 rounded-2xl md:rounded-l-none md:rounded-r-2xl shadow-2xl">
          <div
            className={cn(
              "md:hidden flex justify-center mb-6",
              "transition-all duration-700 ease-out",
              animateLogo ? "opacity-100 scale-100" : "opacity-0 scale-95",
            )}
          >
            <div className="relative w-32 h-32">
              <Image
                src="/images/farmacias-brasil-logo-green.png"
                alt="Farmacias Brasil Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div
            className={cn(
              "space-y-2 mb-6",
              "transition-all duration-700 delay-100 ease-out",
              animateTitle ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Bienvenido de nuevo</h2>
            <p className="text-gray-600 dark:text-gray-300">Acceda a su cuenta para continuar</p>
          </div>

          {error && (
            <Alert
              variant="destructive"
              className={cn(
                "mb-6",
                "transition-all duration-500 ease-out",
                animateForm ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {IS_MOCK_MODE && (
            <Alert
              className={cn(
                "mb-6 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
                "transition-all duration-500 ease-out",
                animateForm ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
            >
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-600 dark:text-blue-400">Modo Simulado</AlertTitle>
              <AlertDescription className="text-blue-600 dark:text-blue-400">
                Use las credenciales predeterminadas para iniciar sesión.
              </AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={onSubmit}
            className={cn(
              "space-y-6",
              "transition-all duration-500 ease-out",
              animateForm ? "opacity-100" : "opacity-0",
            )}
          >
            <div
              className={cn(
                "space-y-2",
                "transition-all duration-500 delay-100 ease-out",
                animateInputs ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
            >
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Correo electrónico
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@farmaciasbrasil.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="pl-3 h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                />
              </div>
            </div>

            <div
              className={cn(
                "space-y-2",
                "transition-all duration-500 delay-200 ease-out",
                animateInputs ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
            >
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Contraseña
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                >
                  ¿Olvidó su contraseña?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="pl-3 h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div
              className={cn(
                "flex items-center",
                "transition-all duration-500 delay-300 ease-out",
                animateInputs ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(checked === true)}
                  disabled={isSubmitting}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 dark:data-[state=checked]:bg-blue-500 dark:data-[state=checked]:border-blue-500"
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Recordarme
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className={cn(
                "w-full h-12 text-base bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 dark:from-blue-700 dark:to-green-600 dark:hover:from-blue-800 dark:hover:to-green-700 border-0",
                "transition-all duration-700 ease-out",
                animateButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>

          <div
            className={cn(
              "mt-8 text-center",
              "transition-all duration-500 delay-400 ease-out",
              animateButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            {IS_MOCK_MODE ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Credenciales de prueba: <span className="font-semibold">admin@farmacia.com / password123</span>
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ¿Problemas para acceder? Contacte a{" "}
                <span className="text-blue-600 dark:text-blue-400">soporte@farmaciasbrasil.com</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

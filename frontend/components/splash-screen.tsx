"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { Inter } from "next/font/google"

// Importar fuente Inter 
const inter = Inter({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
})

interface SplashScreenProps {
  userName?: string
  duration?: number
}

export default function SplashScreen({ userName = "Usuario", duration = 3000 }: SplashScreenProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const [showSplash, setShowSplash] = useState(true)
  const [progress, setProgress] = useState(0)
  const isDark = theme === "dark"

  // Referencia para el contenedor principal
  const containerRef = useRef<HTMLDivElement>(null)

  // Efecto para la barra de progreso
  useEffect(() => {
    if (!showSplash) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, duration / 100)

    return () => clearInterval(interval)
  }, [showSplash, duration])

  // Auto-redirect después de la duración
  useEffect(() => {
    if (!showSplash) return

    const redirectTimer = setTimeout(() => {
      setShowSplash(false)
      setTimeout(() => {
        router.push("/")
      }, 500)
    }, duration)

    return () => clearTimeout(redirectTimer)
  }, [showSplash, router, duration])

  return (
    <AnimatePresence mode="wait">
      {showSplash && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`${inter.className} fixed inset-0 z-50 flex flex-col items-center justify-center ${
            isDark ? "bg-gray-900" : "bg-white"
          }`}
        >
          <div className="relative w-full max-w-md mx-auto flex flex-col items-center justify-center p-8">
            {/* Logo con animación minimalista */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-24 h-24 mb-8"
            >
              <Image
                src="/images/farmacias-brasil-logo-green.png"
                alt="Farmacias Brasil Logo"
                fill
                className="object-contain"
                priority
              />
            </motion.div>

            {/* Línea divisoria animada */}
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "40px" }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-[2px] bg-gradient-to-r from-blue-500 to-green-500 mb-6"
            />

            {/* Mensaje de bienvenida */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mb-8"
            >
              <h2 className={`text-xl font-normal ${isDark ? "text-gray-200" : "text-gray-800"} mb-1`}>Bienvenido</h2>
              <h1 className="text-2xl font-medium bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                {userName}
              </h1>
            </motion.div>

            {/* Barra de progreso */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="w-full max-w-[200px] mb-8"
            >
              <div className={`h-[2px] w-full ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden`}>
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                />
              </div>
            </motion.div>

            {/* Texto de carga */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: progress > 20 ? 0.7 : 0 }}
              transition={{ duration: 0.3 }}
              className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"} tracking-wide uppercase`}
            >
              Preparando sistema
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

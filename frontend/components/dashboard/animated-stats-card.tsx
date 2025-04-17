"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface AnimatedStatsCardProps {
  title: string
  value: string
  description?: string
  icon: React.ReactNode
  isLoading?: boolean
  changeValue?: number
  changePeriodText?: string
  delay?: number
}

export function AnimatedStatsCard({
  title,
  value,
  description,
  icon,
  isLoading = false,
  changeValue,
  changePeriodText = "desde el mes pasado",
  delay = 0,
}: AnimatedStatsCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [displayValue, setDisplayValue] = useState("0")
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Animación de contador
  useEffect(() => {
    if (isLoading) return

    // Solo animar valores numéricos
    const numericValue = value.replace(/[^0-9.]/g, "")
    if (!numericValue || isNaN(Number(numericValue))) {
      setDisplayValue(value)
      return
    }

    const start = 0
    const end = Number.parseFloat(numericValue)
    const duration = 1500
    const startTime = Date.now()

    const animateCount = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Función de easing para hacer la animación más natural
      const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4)
      const easedProgress = easeOutQuart(progress)

      const currentValue = Math.floor(easedProgress * end)

      // Mantener el formato original (con $ o cualquier otro prefijo/sufijo)
      const formattedValue = value.replace(numericValue, currentValue.toString())
      setDisplayValue(formattedValue)

      if (progress < 1) {
        requestAnimationFrame(animateCount)
      } else {
        setDisplayValue(value) // Asegurar que el valor final sea exacto
      }
    }

    requestAnimationFrame(animateCount)
  }, [value, isLoading])

  // Detectar visibilidad para animación de entrada
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true)
    }, 100 + delay)

    return () => clearTimeout(timeout)
  }, [delay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <Card
        className={cn(
          "transition-all duration-300 overflow-hidden",
          isHovered && "transform-gpu scale-[1.02] shadow-lg",
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <motion.div
            animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="text-muted-foreground"
          >
            {icon}
          </motion.div>
        </CardHeader>
        <CardContent className="relative z-10">
          {isLoading ? (
            <>
              <Skeleton className="h-7 w-3/4 mb-1" />
              {description && <Skeleton className="h-4 w-1/2" />}
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">{displayValue}</div>
              {(description || changeValue !== undefined) && (
                <div className="flex items-center text-xs">
                  {changeValue !== undefined && changeValue !== null && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + delay / 1000 }}
                      className={cn(
                        "mr-1 font-medium",
                        changeValue > 0 ? "text-green-600" : changeValue < 0 ? "text-red-600" : "text-gray-500",
                      )}
                    >
                      {changeValue > 0 && "+"}
                      {changeValue.toFixed(1)}%
                    </motion.div>
                  )}
                  {changeValue !== undefined && <span className="text-muted-foreground mr-1">{changePeriodText}</span>}
                  {description && <p className="text-muted-foreground">{description}</p>}
                </div>
              )}
            </>
          )}
        </CardContent>

        {/* Efecto de gradiente en hover */}
        <div
          className={cn(
            "absolute inset-0 opacity-0 transition-opacity duration-300",
            isHovered && "opacity-100",
            isDark
              ? "bg-gradient-to-br from-blue-900/10 to-green-900/10"
              : "bg-gradient-to-br from-blue-50/80 to-green-50/80",
          )}
        />
      </Card>
    </motion.div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { Sparkles, TrendingUp, Users, Package, Activity } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useDashboardApi } from "@/hooks/use-dashboard-api"

export function DashboardHero() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [dismissed, setDismissed] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState("")
  const isDark = theme === "dark"

  // Obtener datos reales del dashboard
  const { stats, isLoadingStats, topSellingProducts, dateFilter } = useDashboardApi()

  // Determinar el momento del día
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) setTimeOfDay("mañana")
    else if (hour >= 12 && hour < 18) setTimeOfDay("tarde")
    else setTimeOfDay("noche")
  }, [])

  // Verificar si ya se mostró hoy
  useEffect(() => {
    const lastShown = localStorage.getItem("dashboard_hero_last_shown")
    const today = new Date().toDateString()

    if (lastShown === today) {
      setDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem("dashboard_hero_last_shown", new Date().toDateString())
  }

  if (dismissed) return null

  // Obtener el texto del saludo según la hora del día
  const getGreeting = () => {
    if (timeOfDay === "mañana") return "¡Buenos días"
    if (timeOfDay === "tarde") return "¡Buenas tardes"
    return "¡Buenas noches"
  }

  // Formatear el cambio de ventas para mostrar signo + cuando es positivo
  const formatChange = (value: number | undefined) => {
    if (value === undefined || value === null) return "+0%"
    return value > 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`
  }

  // Obtener el producto más popular (el primero de la lista de más vendidos)
  const getPopularProduct = () => {
    if (!topSellingProducts || topSellingProducts.length === 0) return "No disponible"
    return topSellingProducts[0]?.name || "No disponible"
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden mb-6 rounded-xl"
      >
        <div
          className={`relative z-10 p-6 ${isDark ? "bg-gradient-to-r from-blue-900/90 to-green-900/90" : "bg-gradient-to-r from-blue-600/90 to-green-500/90"}`}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5),transparent)]"></div>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/10"
                initial={{
                  x: Math.random() * 100 - 50 + "%",
                  y: Math.random() * 100 - 50 + "%",
                  scale: Math.random() * 0.5 + 0.5,
                  opacity: Math.random() * 0.5 + 0.25,
                }}
                animate={{
                  x: [Math.random() * 100 - 50 + "%", Math.random() * 100 - 50 + "%", Math.random() * 100 - 50 + "%"],
                  y: [Math.random() * 100 - 50 + "%", Math.random() * 100 - 50 + "%", Math.random() * 100 - 50 + "%"],
                }}
                transition={{
                  duration: 10 + Math.random() * 20,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{
                  width: Math.random() * 200 + 50,
                  height: Math.random() * 200 + 50,
                  filter: "blur(40px)",
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                </motion.div>
                <h2 className="text-xl font-medium text-white">
                  {getGreeting()}, {user?.name?.split(" ")[0] || "Usuario"}!
                </h2>
              </div>
              <p className="text-white/80 max-w-xl">
                Bienvenido a tu panel de control. Aquí tienes un resumen de la actividad reciente y las métricas clave
                para Farmacias Brasil.
              </p>
            </div>
            <Button
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
              onClick={handleDismiss}
            >
              Entendido
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[
              {
                icon: TrendingUp,
                label: "Ventas en aumento",
                value: isLoadingStats ? "Cargando..." : formatChange(stats?.sales.change),
              },
              {
                icon: Users,
                label: "Clientes nuevos",
                value: isLoadingStats ? "Cargando..." : stats?.customers.count.toString() || "0",
              },
              {
                icon: Package,
                label: "Productos populares",
                value: isLoadingStats ? "Cargando..." : getPopularProduct(),
              },
              {
                icon: Activity,
                label: "Actividad reciente",
                value: isLoadingStats
                  ? "Cargando..."
                  : stats?.transactions.count > 10
                    ? "Alta"
                    : stats?.transactions.count > 5
                      ? "Media"
                      : "Baja",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3"
              >
                <div className="rounded-full bg-white/20 p-2">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">{item.label}</p>
                  <p className="text-white font-medium">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

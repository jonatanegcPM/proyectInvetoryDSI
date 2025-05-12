"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Building,
  ChevronRight,
  BarChart3,
  LogOut,
  Moon,
  Package,
  Settings,
  ShoppingCart,
  Sun,
  Users,
  PieChart,
  TrendingUp,
  FileBarChart,
  Bell,
  Menu,
  User,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { PharmacyAssistant } from "@/components/assistant/pharmacy-assistant"
import { UserOnboarding } from "@/components/onboarding/user-onboarding"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    setMounted(true)
    const savedSidebarState = localStorage.getItem("sidebarOpen")
    setSidebarOpen(savedSidebarState === "false" ? false : true)
  }, [pathname])

  useEffect(() => {
    if (mounted && sidebarOpen !== null) {
      localStorage.setItem("sidebarOpen", String(sidebarOpen))
    }
  }, [sidebarOpen, mounted])

  const navItems = [
    { icon: LayoutDashboard, label: "Panel Principal", href: "/" },
    { icon: ShoppingCart, label: "Punto de Venta", href: "/point-of-sale" },
    { icon: Package, label: "Inventario", href: "/inventory" },
    { icon: Users, label: "Clientes", href: "/customers" },
    { icon: Building, label: "Proveedores", href: "/suppliers" },
    { icon: Settings, label: "Configuración", href: "/settings" },
  ]

  // Renombradas las opciones para evitar confusiones
  const reportItems = [
    { icon: BarChart3, label: "Análisis de Ventas", href: "/reports/sales" },
    { icon: PieChart, label: "Análisis de Inventario", href: "/reports/inventory" },
    { icon: TrendingUp, label: "Tendencias de Mercado", href: "/reports/trends" },
    { icon: FileBarChart, label: "Informes Personalizados", href: "/reports/custom" },
  ]

  const getPageTitle = () => {
    if (pathname === "/profile") return "Mi Perfil"

    const mainItem = navItems.find((item) => item.href === pathname)
    if (mainItem) return mainItem.label

    const reportItem = reportItems.find((item) => item.href === pathname)
    if (reportItem) return `Reportes - ${reportItem.label}`

    return "Farmacias Brasil"
  }

  const handleNavigateToProfile = () => {
    router.push("/profile")
  }

  if (sidebarOpen === null) {
    return <div className="min-h-screen bg-background"></div>
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Versión de escritorio */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-card shadow-md fixed h-full z-30 transition-all duration-300 ease-in-out hidden md:flex flex-col`}
      >
        {/* Logo y branding - Mejorado visualmente */}
        <div className="p-4 flex items-center justify-between border-b">
          <div className={`flex items-center ${!sidebarOpen ? "justify-center w-full" : ""}`}>
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-1.5 rounded-md flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300">
              <img
                src="/farmacias-brasil-logo-bandera.png"
                alt="Logo Farmacias Brasil"
                className="h-7 w-auto drop-shadow-sm"
              />
            </div>
            {sidebarOpen && (
              <div className="ml-2 flex flex-col">
                <span className="font-bold text-lg leading-none">Farmacias Brasil</span>
                <span className="text-xs text-muted-foreground">Sistema POS v1.0</span>
              </div>
            )}
          </div>
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
          <div className="px-3 mb-2">
            {sidebarOpen && <p className="text-xs font-medium text-muted-foreground mb-2 ml-2">MENÚ PRINCIPAL</p>}
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Button
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start rounded-md",
                      !sidebarOpen && "justify-center px-2",
                      pathname === item.href && "bg-primary/10 text-primary font-medium",
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      <item.icon className={cn("h-5 w-5", sidebarOpen ? "mr-2" : "mx-auto")} />
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Línea divisoria cuando el sidebar está contraído */}
          {!sidebarOpen && <div className="mx-3 my-4 border-t border-border/50"></div>}

          {/* Sección de Reportes y Análisis */}
          <div className="px-3 mt-6">
            {sidebarOpen && (
              <div className="flex items-center mb-2 ml-2">
                <p className="text-xs font-medium text-muted-foreground">ANÁLISIS AVANZADO</p>
                <span className="ml-2 text-[10px] italic font-medium text-amber-500 dark:text-amber-400">
                  próximamente
                </span>
              </div>
            )}

            {/* Mostrar directamente las opciones de reportes */}
            <ul className="space-y-1">
              {reportItems.map((item) => (
                <li key={item.href}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start rounded-md opacity-60 cursor-not-allowed",
                            !sidebarOpen && "justify-center px-2",
                            !sidebarOpen && "h-10",
                          )}
                          disabled
                        >
                          <item.icon className={cn("h-5 w-5", sidebarOpen ? "mr-2" : "mx-auto")} />
                          {sidebarOpen && <span>{item.label}</span>}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side={sidebarOpen ? "right" : "right"}>
                        <p>Función próximamente disponible</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Perfil de usuario */}
        <div className="p-4 border-t bg-muted/30">
          <div className={`flex items-center ${!sidebarOpen && "justify-center"}`}>
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
              {user?.avatar && <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user?.name || "Usuario"} />}
            </Avatar>
            {sidebarOpen && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate max-w-[140px]">{user?.name || "Usuario"}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {user?.roleName || `Rol ${user?.role || "desconocido"}`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header y contenido principal */}
      <div
        className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
        style={{ marginLeft: mounted ? (sidebarOpen ? "16rem" : "5rem") : "0" }}
      >
        {/* Header */}
        <header
          className="border-b bg-background/95 backdrop-blur-sm fixed top-0 right-0 z-20 shadow-sm transition-all duration-300 ease-in-out"
          style={{
            left: mounted ? (sidebarOpen ? "16rem" : "5rem") : "0",
          }}
        >
          <div className="flex h-16 items-center px-4 justify-between">
            {/* Lado izquierdo del header */}
            <div className="flex items-center gap-3">
              {/* Botón de menú móvil */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Botón para expandir sidebar en escritorio */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <ChevronRight className={`h-5 w-5 transition-transform ${!sidebarOpen ? "" : "rotate-180"}`} />
              </Button>

              {/* Título de la página */}
              <div>
                <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Lado derecho del header - Iconos con color suavizado y espaciado ajustado */}
            <TooltipProvider>
              <div className="flex items-center gap-2">
                {/* Notificaciones - Con color suavizado */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-muted-foreground hover:text-foreground"
                          >
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                          <DropdownMenuLabel className="flex justify-between items-center">
                            <span>Notificaciones</span>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              2 nuevas
                            </span>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <div className="max-h-80 overflow-auto">
                            <DropdownMenuItem className="flex flex-col items-start p-3 hover:bg-accent cursor-pointer">
                              <div className="flex items-center w-full">
                                <div className="bg-yellow-100 p-2 rounded-full mr-2">
                                  <Package className="h-4 w-4 text-yellow-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">Stock bajo en Paracetamol</p>
                                  <p className="text-xs text-muted-foreground">Hace 10 minutos</p>
                                </div>
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start p-3 hover:bg-accent cursor-pointer">
                              <div className="flex items-center w-full">
                                <div className="bg-green-100 p-2 rounded-full mr-2">
                                  <Building className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">Nueva orden de proveedor recibida</p>
                                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                                </div>
                              </div>
                            </DropdownMenuItem>
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="justify-center text-primary text-sm font-medium">
                            Ver todas las notificaciones
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Notificaciones</p>
                  </TooltipContent>
                </Tooltip>

                {/* Selector de tema - Ya tiene color suavizado */}
                {mounted && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {theme === "dark" ? (
                          <Sun className="h-[1.2rem] w-[1.2rem]" />
                        ) : (
                          <Moon className="h-[1.2rem] w-[1.2rem]" />
                        )}
                        <span className="sr-only">Cambiar tema</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Cambiar a modo {theme === "dark" ? "claro" : "oscuro"}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Menú de usuario */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 border">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <div className="flex items-center justify-start p-2 pb-3 border-b">
                            <Avatar className="h-9 w-9 mr-2">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <p className="font-medium text-sm">{user?.name || "Usuario"}</p>
                              <p className="text-xs text-muted-foreground">
                                {user?.roleName || `Rol ${user?.role || "desconocido"}`}
                              </p>
                            </div>
                          </div>
                          <DropdownMenuItem
                            className="flex items-center py-2 mt-1 cursor-pointer"
                            onClick={handleNavigateToProfile}
                          >
                            <User className="h-4 w-4 mr-2" />
                            <span>Mi Perfil</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={logout}
                            className="text-red-500 flex items-center py-2 hover:text-red-600 hover:bg-red-50 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            <span>Cerrar sesión</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Mi cuenta</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </header>

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="fixed inset-y-0 left-0 w-64 bg-card shadow-lg p-4 flex flex-col">
              {/* Logo */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-green-500 to-blue-600 p-1.5 rounded-md">
                    <img src="/farmacias-brasil-logo-bandera.png" alt="Logo Farmacias Brasil" className="h-7 w-auto" />
                  </div>
                  <div className="ml-2">
                    <span className="font-bold text-lg leading-none">Farmacias Brasil</span>
                    <span className="text-xs text-muted-foreground block">Sistema POS v1.0</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <ChevronRight className="h-5 w-5 rotate-180" />
                </Button>
              </div>

              {/* Navegación móvil */}
              <nav className="flex-1 py-4 overflow-y-auto">
                <p className="text-xs font-medium text-muted-foreground mb-2 ml-2">MENÚ PRINCIPAL</p>
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Button
                        variant={pathname === item.href ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start rounded-md",
                          pathname === item.href && "bg-primary/10 text-primary font-medium",
                        )}
                        asChild
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-5 w-5 mr-2" />
                          <span>{item.label}</span>
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>

                {/* Sección de reportes en móvil */}
                <div className="mt-6">
                  <div className="flex items-center mb-2 ml-2">
                    <p className="text-xs font-medium text-muted-foreground">ANÁLISIS AVANZADO</p>
                    <span className="ml-2 text-[10px] italic font-medium text-amber-500 dark:text-amber-400">
                      próximamente
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {reportItems.map((item) => (
                      <li key={item.href}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start rounded-md opacity-60 cursor-not-allowed"
                          disabled
                        >
                          <item.icon className="h-5 w-5 mr-2" />
                          <span>{item.label}</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>

              {/* Perfil de usuario en móvil */}
              <div className="border-t pt-4 mt-auto">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{user?.name || "Usuario"}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.roleName || `Rol ${user?.role || "desconocido"}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="ml-auto text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <main className="flex-1 overflow-auto p-4 md:p-6 mt-16">{children}</main>

        {/* Asistente virtual */}
        <PharmacyAssistant />

        {/* Onboarding para nuevos usuarios */}
        <UserOnboarding />
      </div>
    </div>
  )
}

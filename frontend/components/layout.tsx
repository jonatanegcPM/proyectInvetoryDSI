"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  Building,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Package,
  Settings,
  ShoppingCart,
  Sun,
  Users,
  Pill,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "./theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean | null>(null)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    setMounted(true)
    const savedSidebarState = localStorage.getItem("sidebarOpen")
    setSidebarOpen(savedSidebarState === "false" ? false : true)
  }, [])

  useEffect(() => {
    if (mounted && sidebarOpen !== null) {
      localStorage.setItem("sidebarOpen", String(sidebarOpen))
    }
  }, [sidebarOpen, mounted])

  const navItems = [
    { icon: Activity, label: "Dashboard", href: "/" },
    { icon: ShoppingCart, label: "Point of Sale", href: "/point-of-sale" },
    { icon: Package, label: "Inventory", href: "/inventory" },
    { icon: Users, label: "Customers", href: "/customers" },
    { icon: Building, label: "Suppliers", href: "/suppliers" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  if (sidebarOpen === null) {
    return <div className="min-h-screen bg-background"></div>
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar -  fijo */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-card border-r flex flex-col fixed h-full`}
        style={{ transition: mounted ? "width 0.3s ease" : "none" }}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <div className={`flex items-center ${!sidebarOpen && "justify-center w-full"}`}>
            <Pill className="h-6 w-6 text-primary" />
            {sidebarOpen && <span className="ml-2 font-semibold text-lg">Farmacias Brasil</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`${!sidebarOpen && "hidden"}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={`w-full justify-start ${!sidebarOpen && "justify-center px-2"}`}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5 mr-2" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="Avatar" />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              {sidebarOpen && (
                <div className="ml-2">
                  <p className="text-sm font-medium">{user?.name || "Usuario"}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role === "1" || user?.role === 1 ? "Administrador" : "Usuario"}
                  </p>
                </div>
              )}
            </div>
            {/* Botón de cierre de sesión con tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-100/50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cerrar sesión</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Main Content - Ajustado para dar espacio al sidebar fijo */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <header
          className="border-b fixed top-0 right-0 left-0 bg-background z-10"
          style={{ marginLeft: sidebarOpen ? "16rem" : "5rem" }}
        >
          <div className="flex h-16 items-center px-4 justify-between">
            <div className="flex items-center">
              {!sidebarOpen && (
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              <h1 className="text-2xl font-semibold ml-4">{navItems.find((item) => item.href === pathname)?.label}</h1>
            </div>
            <div className="flex items-center gap-2">
              {mounted && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="mr-2"
                >
                  {theme === "dark" ? (
                    <Sun className="h-[1.2rem] w-[1.2rem]" />
                  ) : (
                    <Moon className="h-[1.2rem] w-[1.2rem]" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 mt-16">{children}</main>
      </div>
    </div>
  )
}


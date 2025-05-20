"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { NotificationService } from "@/services/notification-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

// Tipos
export type NotificationType = "info" | "warning" | "success" | "error"

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  timestamp: Date
  read: boolean
  icon?: React.ReactNode
  category?: string
  entityId?: string
  entityType?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  totalPages?: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  fetchNotifications: (page?: number, filter?: "all" | "unread" | "read") => void
  refreshUnreadCount: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  // Refrescar el contador de notificaciones no leídas
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const count = await NotificationService.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error("Error fetching unread count:", error)
    }
  }, [isAuthenticated])

  // Cargar notificaciones iniciales
  const fetchNotifications = useCallback(
    async (page = 1, filter: "all" | "unread" | "read" = "all") => {
      if (!isAuthenticated) return

      try {
        setLoading(true)
        const response = await NotificationService.getNotifications(page, 10, filter)

        const mappedNotifications = response.notifications.map(NotificationService.mapApiNotificationToInternal)

        setNotifications(mappedNotifications)
        setTotalPages(response.totalPages)

        // Actualizar contador de no leídas
        await refreshUnreadCount()
      } catch (error) {
        console.error("Error fetching notifications:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las notificaciones",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated, refreshUnreadCount, toast],
  )

  // Añadir notificación (simulado, en producción esto vendría del backend)
  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
    }

    setNotifications((prev) => [newNotification, ...prev])
    if (!notification.read) {
      setUnreadCount((prev) => prev + 1)
    }
  }, [])

  // Eliminar notificación
  const removeNotification = useCallback(
    async (id: string) => {
      try {
        await NotificationService.deleteNotification(id)

        setNotifications((prev) => {
          const notification = prev.find((n) => n.id === id)
          if (notification && !notification.read) {
            setUnreadCount((count) => Math.max(0, count - 1))
          }
          return prev.filter((n) => n.id !== id)
        })
      } catch (error) {
        console.error(`Error removing notification ${id}:`, error)
        toast({
          title: "Error",
          description: "No se pudo eliminar la notificación",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  // Marcar como leída
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await NotificationService.markAsRead(id)

        setNotifications((prev) =>
          prev.map((n) => {
            if (n.id === id && !n.read) {
              setUnreadCount((count) => Math.max(0, count - 1))
              return { ...n, read: true }
            }
            return n
          }),
        )
      } catch (error) {
        console.error(`Error marking notification ${id} as read:`, error)
        toast({
          title: "Error",
          description: "No se pudo marcar la notificación como leída",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead()

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)

      toast({
        title: "Éxito",
        description: "Todas las notificaciones han sido marcadas como leídas",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "No se pudieron marcar todas las notificaciones como leídas",
        variant: "destructive",
      })
    }
  }, [toast])

  // Cargar notificaciones y contador al iniciar y cuando cambia el estado de autenticación
  useEffect(() => {
    // No hacer nada si la autenticación está cargando
    if (authLoading) return

    // Si el usuario está autenticado, cargar datos
    if (isAuthenticated) {
      // Cargar contador de no leídas inmediatamente
      refreshUnreadCount()

      // Cargar notificaciones
      fetchNotifications()

      // Actualizar contador de no leídas periódicamente
      const intervalId = setInterval(() => {
        refreshUnreadCount()
      }, 30000) // Cada 30 segundos

      return () => clearInterval(intervalId)
    }
  }, [isAuthenticated, authLoading, fetchNotifications, refreshUnreadCount])

  const value = {
    notifications,
    unreadCount,
    loading,
    totalPages,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    refreshUnreadCount,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

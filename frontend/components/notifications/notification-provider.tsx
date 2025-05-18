"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { NotificationService } from "@/services/notification-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context" // Importamos el contexto de autenticación

export type NotificationType = "info" | "warning" | "success" | "error"

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  icon?: React.ReactNode
  timestamp: Date
  read: boolean
  category?: string
  entityId?: string
  entityType?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  fetchNotifications: (page?: number, filter?: "all" | "unread" | "read", category?: string) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  removeNotification: (id: string) => Promise<void>
  refreshUnreadCount: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const { toast } = useToast()
  const { isAuthenticated, isLoading: authLoading } = useAuth() // Obtenemos el estado de autenticación

  // Fetch notifications from API
  const fetchNotifications = useCallback(
    async (page = 1, filter: "all" | "unread" | "read" = "all", category?: string) => {
      // Solo cargar notificaciones si el usuario está autenticado
      if (!isAuthenticated) return

      setLoading(true)
      setError(null)
      try {
        const response = await NotificationService.getNotifications(page, 20, filter, category)

        const mappedNotifications = response.notifications.map(NotificationService.mapApiNotificationToInternal)

        setNotifications(mappedNotifications)
        setCurrentPage(response.page)
        setTotalPages(response.totalPages)
        setLoading(false)
      } catch (err) {
        setError("Error al cargar notificaciones")
        setLoading(false)
        // Solo mostrar toast de error si el usuario está autenticado
        if (isAuthenticated) {
          toast({
            title: "Error",
            description: "No se pudieron cargar las notificaciones",
            variant: "destructive",
          })
        }
        console.error("Error fetching notifications:", err)
      }
    },
    [toast, isAuthenticated],
  )

  // Refresh unread count
  const refreshUnreadCount = useCallback(async () => {
    // Solo cargar conteo si el usuario está autenticado
    if (!isAuthenticated) return

    try {
      const count = await NotificationService.getUnreadCount()
      setUnreadCount(count)
    } catch (err) {
      console.error("Error fetching unread count:", err)
    }
  }, [isAuthenticated])

  // Mark notification as read
  const markAsRead = useCallback(
    async (id: string) => {
      if (!isAuthenticated) return

      try {
        await NotificationService.markAsRead(id)

        // Update local state
        setNotifications((prev) =>
          prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
        )

        // Refresh unread count
        refreshUnreadCount()
      } catch (err) {
        toast({
          title: "Error",
          description: "No se pudo marcar la notificación como leída",
          variant: "destructive",
        })
        console.error(`Error marking notification ${id} as read:`, err)
      }
    },
    [refreshUnreadCount, toast, isAuthenticated],
  )

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      await NotificationService.markAllAsRead()

      // Update local state
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
      setUnreadCount(0)

      toast({
        title: "Éxito",
        description: "Todas las notificaciones han sido marcadas como leídas",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudieron marcar todas las notificaciones como leídas",
        variant: "destructive",
      })
      console.error("Error marking all notifications as read:", err)
    }
  }, [toast, isAuthenticated])

  // Remove notification
  const removeNotification = useCallback(
    async (id: string) => {
      if (!isAuthenticated) return

      try {
        await NotificationService.deleteNotification(id)

        // Update local state
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))

        // Refresh unread count if needed
        refreshUnreadCount()

        toast({
          title: "Éxito",
          description: "Notificación eliminada correctamente",
        })
      } catch (err) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la notificación",
          variant: "destructive",
        })
        console.error(`Error removing notification ${id}:`, err)
      }
    },
    [refreshUnreadCount, toast, isAuthenticated],
  )

  // Initial load and polling setup
  useEffect(() => {
    // No hacer nada si la autenticación está cargando o el usuario no está autenticado
    if (authLoading || !isAuthenticated) return

    // Cargar notificaciones iniciales
    fetchNotifications()
    refreshUnreadCount()

    // Set up polling for unread count (every 30 seconds)
    const intervalId = setInterval(() => {
      refreshUnreadCount()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [fetchNotifications, refreshUnreadCount, isAuthenticated, authLoading])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        removeNotification,
        refreshUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

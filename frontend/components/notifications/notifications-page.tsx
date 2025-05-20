"use client"

import { useState, useEffect, useMemo } from "react"
import { useNotifications, type NotificationType } from "./notification-provider"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Bell, Check, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

// Función para normalizar texto (eliminar acentos)
function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

export function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    fetchNotifications,
    totalPages,
  } = useNotifications()
  const { toast } = useToast()

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filtrar notificaciones basado en los criterios
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications]

    // Filtrar por término de búsqueda (insensible a acentos)
    if (searchTerm) {
      const normalizedSearchTerm = normalizeText(searchTerm)
      filtered = filtered.filter(
        (notification) =>
          normalizeText(notification.title).includes(normalizedSearchTerm) ||
          normalizeText(notification.message).includes(normalizedSearchTerm),
      )
    }

    return filtered
  }, [notifications, searchTerm])

  // Cargar notificaciones cuando cambia el filtro
  useEffect(() => {
    fetchNotifications(currentPage, filter)
  }, [fetchNotifications, currentPage, filter])

  // Formatear la fecha para mostrar
  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true, locale: es })
    } else if (diffInHours < 48) {
      return "Ayer"
    } else {
      return format(date, "dd MMM yyyy, HH:mm", { locale: es })
    }
  }

  // Obtener estilos basados en el tipo de notificación
  const getTypeStyles = (type: NotificationType) => {
    switch (type) {
      case "warning":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
          text: "text-yellow-600 dark:text-yellow-400",
          border: "border-yellow-500",
          badge: "bg-yellow-500",
        }
      case "success":
        return {
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-600 dark:text-green-400",
          border: "border-green-500",
          badge: "bg-green-500",
        }
      case "error":
        return {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-600 dark:text-red-400",
          border: "border-red-500",
          badge: "bg-red-500",
        }
      default:
        return {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-600 dark:text-blue-400",
          border: "border-blue-500",
          badge: "bg-blue-500",
        }
    }
  }

  // Manejar clic en notificación
  const handleNotificationClick = (id: string) => {
    markAsRead(id)
  }

  // Obtener el nombre de la categoría formateado
  const getCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  // Verificar si estamos en la última página
  const isLastPage = totalPages !== undefined && currentPage >= totalPages

  // Eliminar todas las notificaciones
  const deleteAllNotifications = async () => {
    setIsDeleting(true)
    try {
      // Eliminar cada notificación individualmente
      const deletePromises = notifications.map((notification) => removeNotification(notification.id))
      await Promise.all(deletePromises)

      toast({
        title: "Éxito",
        description: "Todas las notificaciones han sido eliminadas",
      })

      // Recargar la primera página
      setCurrentPage(1)
      fetchNotifications(1, filter)
    } catch (error) {
      console.error("Error deleting all notifications:", error)
      toast({
        title: "Error",
        description: "No se pudieron eliminar todas las notificaciones",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Centro de Notificaciones</h1>
          <p className="text-muted-foreground">Gestiona y visualiza todas tus notificaciones del sistema.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
              <Check className="h-4 w-4 mr-2" />
              Marcar todas como leídas
            </Button>
          )}
          {notifications.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar todas
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar todas las notificaciones?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Todas las notificaciones serán eliminadas permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAllNotifications} disabled={isDeleting}>
                    {isDeleting ? "Eliminando..." : "Eliminar todas"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Buscar</CardTitle>
          <CardDescription>Busca notificaciones por título o contenido</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar notificaciones..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as "all" | "unread" | "read")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="unread">
            No leídas {unreadCount > 0 && <Badge className="ml-2">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="read">Leídas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderNotificationList()}
        </TabsContent>
        <TabsContent value="unread" className="mt-6">
          {renderNotificationList()}
        </TabsContent>
        <TabsContent value="read" className="mt-6">
          {renderNotificationList()}
        </TabsContent>
      </Tabs>

      {/* Paginación */}
      {filteredNotifications.length > 0 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1)
                  }
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                {currentPage}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentPage(currentPage + 1)
                }}
                className={isLastPage ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )

  // Función para renderizar la lista de notificaciones
  function renderNotificationList() {
    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )
    }

    if (filteredNotifications.length === 0) {
      return (
        <Card className="overflow-hidden">
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-muted/30 p-4 rounded-full mb-4">
              <Bell className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-medium mb-1">No hay notificaciones</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {searchTerm
                ? "No se encontraron notificaciones con los criterios de búsqueda. Intenta con otros términos."
                : filter === "unread"
                  ? "No tienes notificaciones sin leer en este momento."
                  : filter === "read"
                    ? "No tienes notificaciones leídas en este momento."
                    : "No tienes notificaciones en este momento."}
            </p>
          </div>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {filteredNotifications.map((notification) => {
          const typeStyles = getTypeStyles(notification.type)
          return (
            <Card
              key={notification.id}
              className={cn(
                "overflow-hidden transition-all hover:shadow-md",
                notification.read ? "" : `border-l-4 ${typeStyles.border}`,
              )}
            >
              <div className="p-4">
                <div className="flex gap-4">
                  <div
                    className={`${typeStyles.bg} p-2 rounded-full shrink-0 h-10 w-10 flex items-center justify-center`}
                  >
                    {notification.icon || <Bell className={`h-5 w-5 ${typeStyles.text}`} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2 mb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">{notification.title}</h3>
                        {notification.category && (
                          <Badge variant="outline" className="text-xs">
                            {getCategoryName(notification.category)}
                          </Badge>
                        )}
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                            Nueva
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <div className="flex justify-between mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleNotificationClick(notification.id)}
                        disabled={notification.read}
                      >
                        {notification.read ? "Leída" : "Marcar como leída"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive hover:text-destructive/90"
                        onClick={() => removeNotification(notification.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    )
  }
}

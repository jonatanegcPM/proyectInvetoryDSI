"use client"

import { useState } from "react"
import { Bell, Check, Trash2 } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useNotifications, type NotificationType } from "./notification-provider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, removeNotification, fetchNotifications } =
    useNotifications()

  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [isOpen, setIsOpen] = useState(false)

  // Handle filter change
  const handleFilterChange = (newFilter: "all" | "unread") => {
    setFilter(newFilter)
    fetchNotifications(1, newFilter)
  }

  // Format the timestamp to a relative time (e.g., "2 hours ago")
  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true, locale: es })
    } else if (diffInHours < 48) {
      return "Ayer"
    } else {
      return format(date, "dd MMM", { locale: es })
    }
  }

  // Handle notification click
  const handleNotificationClick = (id: string) => {
    markAsRead(id)
  }

  // Get background color based on notification type
  const getTypeStyles = (type: NotificationType) => {
    switch (type) {
      case "warning":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
          text: "text-yellow-600 dark:text-yellow-400",
        }
      case "success":
        return {
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-600 dark:text-green-400",
        }
      case "error":
        return {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-600 dark:text-red-400",
        }
      default:
        return {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-600 dark:text-blue-400",
        }
    }
  }

  // Handle dropdown open
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      // Refresh notifications when opening the dropdown
      fetchNotifications(1, filter)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[320px] p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <h3 className="font-medium text-sm">Notificaciones</h3>
                    {unreadCount > 0 && (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        {unreadCount} {unreadCount === 1 ? "nueva" : "nuevas"}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => markAllAsRead()}>
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Marcar leídas
                    </Button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex border-b">
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex-1 rounded-none text-xs py-1.5",
                      filter === "all" && "border-b-2 border-primary text-primary",
                    )}
                    onClick={() => handleFilterChange("all")}
                  >
                    Todas
                  </Button>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex-1 rounded-none text-xs py-1.5",
                      filter === "unread" && "border-b-2 border-primary text-primary",
                    )}
                    onClick={() => handleFilterChange("unread")}
                  >
                    No leídas
                  </Button>
                </div>

                {/* Notification List */}
                <div className="max-h-[300px] overflow-y-auto">
                  {loading ? (
                    // Loading skeleton
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="p-3 border-b">
                        <div className="flex gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-full mb-1" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : notifications.length > 0 ? (
                    notifications.map((notification) => {
                      const typeStyles = getTypeStyles(notification.type)
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-3 hover:bg-accent cursor-pointer transition-colors border-b last:border-b-0 group",
                            notification.read ? "opacity-70" : "border-l-2",
                            notification.read
                              ? ""
                              : notification.type === "warning"
                                ? "border-l-yellow-500"
                                : notification.type === "success"
                                  ? "border-l-green-500"
                                  : notification.type === "error"
                                    ? "border-l-red-500"
                                    : "border-l-blue-500",
                          )}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`${typeStyles.bg} p-2 rounded-full shrink-0 h-8 w-8 flex items-center justify-center`}
                            >
                              {notification.icon || <Bell className={`h-4 w-4 ${typeStyles.text}`} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-sm">{notification.title}</p>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeNotification(notification.id)
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                      <div className="bg-muted/30 p-3 rounded-full mb-3">
                        <Bell className="h-5 w-5 text-muted-foreground/60" />
                      </div>
                      <p className="text-sm font-medium">No hay notificaciones</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {filter === "all"
                          ? "No tienes notificaciones en este momento."
                          : "No tienes notificaciones sin leer."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="border-t p-2 flex justify-center">
                    <Button variant="ghost" size="sm" className="text-xs text-primary">
                      Ver todas
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Notificaciones</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

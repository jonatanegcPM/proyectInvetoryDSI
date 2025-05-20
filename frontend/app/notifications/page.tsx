import type { Metadata } from "next"
import { NotificationsPage } from "@/components/notifications/notifications-page"
import { AuthCheck } from "@/components/auth-check"
import Layout from "@/components/layout"

export const metadata: Metadata = {
  title: "Notificaciones | Farmacias Brasil",
  description: "Gestión de notificaciones del sistema",
}

export default function NotificationsRoute() {
  return (
    <AuthCheck>
      <Layout>
      <NotificationsPage />
      </Layout>
    </AuthCheck>
  )
}

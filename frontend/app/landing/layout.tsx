import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Farmacias Brasil - Sistema de Gestión Farmacéutica",
  description: "Sistema integral para la gestión de farmacias: inventario, ventas, clientes y más.",
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen">{children}</div>
}

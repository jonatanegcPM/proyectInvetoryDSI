import Login from "@/components/login"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - Farmacias Brasil POS",
  description: "Accede al sistema de gestión de farmacia",
}

export default function LoginPage() {
  return <Login />
}


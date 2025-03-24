import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const metadata: Metadata = {
  title: "Recuperar Contraseña - Farmacias Brasil POS",
  description: "Recupera tu contraseña del sistema de gestión de farmacia",
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-primary">Recuperar contraseña</CardTitle>
          <CardDescription>Ingrese su correo electrónico para recibir un enlace de recuperación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" placeholder="correo@ejemplo.com" type="email" />
          </div>
          <Button className="w-full">Enviar enlace de recuperación</Button>
        </CardContent>
        <CardFooter>
          <Link href="/login" className="flex items-center text-sm text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}


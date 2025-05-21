"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Palette } from "lucide-react"
import { AppearanceSettings } from "./appearance-settings"
import { NotificationSettings } from "./notification-settings"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("appearance")

  return (
    <div className="container mx-auto py-6 px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-center w-full mb-6">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="appearance" className="flex-1">
              <div className="flex items-center justify-center gap-1">
                <Palette className="h-4 w-4" />
                <span className="text-sm">Apariencia</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1">
              <div className="flex items-center justify-center gap-1">
                <Bell className="h-4 w-4" />
                <span className="text-sm">Notificaciones</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="appearance">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <Palette className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 dark:text-blue-400" />
                Apariencia
              </CardTitle>
              <CardDescription>
                Personaliza la apariencia visual de la aplicación según tus preferencias.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppearanceSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 dark:text-amber-400" />
                Notificaciones
              </CardTitle>
              <CardDescription>Configura qué notificaciones quieres recibir y cómo quieres recibirlas.</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

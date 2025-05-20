"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/contexts/auth-context"
import { UserService, type UserData } from "@/services/user-service"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, User, Lock, Shield, History, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Define the form schema
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  username: z.string().min(2, {
    message: "El nombre de usuario debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor ingrese un correo electrónico válido.",
  }),
})

// Define the password form schema
const passwordFormSchema = z
  .object({
    newPassword: z.string().min(8, {
      message: "La nueva contraseña debe tener al menos 8 caracteres.",
    }),
    confirmPassword: z.string().min(8, {
      message: "La confirmación de contraseña debe tener al menos 8 caracteres.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  })

type ProfileFormValues = z.infer<typeof profileFormSchema>
type PasswordFormValues = z.infer<typeof passwordFormSchema>

export function UserProfile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)

  // Profile form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
    },
    mode: "onChange",
  })

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  })

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setIsFetching(true)
      try {
        const data = await UserService.getCurrentUser()
        if (data) {
          setUserData(data)

          // Update form values
          form.setValue("name", data.name || "")
          form.setValue("username", data.username || "")
          form.setValue("email", data.email || "")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del usuario",
          variant: "destructive",
        })
      } finally {
        setIsFetching(false)
      }
    }

    if (user?.id) {
      fetchUserData()
    }
  }, [user, form, toast])

  // Handle profile form submission
  async function onSubmit(data: ProfileFormValues) {
    if (!userData) return

    setIsLoading(true)
    setSaveSuccess(false)

    try {
      const updateData = {
        userId: userData.userID,
        Name: data.name,
        Username: data.username,
        Email: data.email,
      }

      const updatedUser = await UserService.updateProfile(updateData)

      if (updatedUser) {
        setUserData(updatedUser)
        setSaveSuccess(true)
        toast({
          title: "Perfil actualizado",
          description: "Tu información ha sido actualizada correctamente.",
        })

        // Reset success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar tu perfil. Por favor intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle password form submission
  async function onPasswordSubmit(data: PasswordFormValues) {
    if (!userData) return

    setIsLoading(true)
    setPasswordSuccess(false)

    try {
      const updatedUser = await UserService.updatePassword(userData.userID, data.newPassword)

      if (updatedUser) {
        setPasswordSuccess(true)
        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido actualizada correctamente.",
        })

        // Reset form fields
        passwordForm.setValue("newPassword", "")
        passwordForm.setValue("confirmPassword", "")

        // Reset success message after 3 seconds
        setTimeout(() => setPasswordSuccess(false), 3000)
      }
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar tu contraseña.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es })
    } catch (error) {
      return "Fecha no disponible"
    }
  }

  if (isFetching) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando información del perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">Administra tu información personal y configuración de cuenta.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-[250px_1fr]">
          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {userData?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-medium text-lg">{userData?.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{userData?.email}</p>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {userData?.role?.roleName || `Rol ${userData?.roleID || "desconocido"}`}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-4 mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>Usuario: {userData?.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span>Cuenta creada: {userData?.createdAt ? formatDate(userData.createdAt) : "No disponible"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="space-y-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Información Personal</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Seguridad</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>
                      Actualiza tu información personal. Esta información será visible para otros usuarios del sistema.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {saveSuccess && (
                      <Alert className="mb-6 bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>¡Guardado exitoso!</AlertTitle>
                        <AlertDescription>Tu información personal ha sido actualizada correctamente.</AlertDescription>
                      </Alert>
                    )}

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre completo</FormLabel>
                              <FormControl>
                                <Input placeholder="Tu nombre" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre de usuario</FormLabel>
                              <FormControl>
                                <Input placeholder="Tu nombre de usuario" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correo electrónico</FormLabel>
                              <FormControl>
                                <Input placeholder="tu@ejemplo.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            "Guardar cambios"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Seguridad</CardTitle>
                    <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {passwordSuccess && (
                      <Alert className="mb-6 bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>¡Contraseña actualizada!</AlertTitle>
                        <AlertDescription>Tu contraseña ha sido actualizada correctamente.</AlertDescription>
                      </Alert>
                    )}

                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nueva contraseña</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormDescription>La contraseña debe tener al menos 8 caracteres.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar nueva contraseña</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Actualizando...
                            </>
                          ) : (
                            "Actualizar contraseña"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Save } from "lucide-react"

const pharmacyInfoSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  phone: z.string().min(1, "El teléfono es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  taxId: z.string().min(1, "El ID fiscal es requerido"),
})

type PharmacyInfoValues = z.infer<typeof pharmacyInfoSchema>

export function PharmacyInfoForm() {
  const [isSaving, setIsSaving] = useState(false)

  const defaultValues: PharmacyInfoValues = {
    name: "Farmacias Brasil",
    address: "Boulevard Los Próceres, #123, San Salvador, El Salvador",
    phone: "+503 2606-0000",
    email: "info@farmaciasbrasil.com",
    taxId: "0614-010123-001-3",
  }

  const form = useForm<PharmacyInfoValues>({
    resolver: zodResolver(pharmacyInfoSchema),
    defaultValues,
  })

  async function onSubmit(data: PharmacyInfoValues) {
    setIsSaving(true)

    try {
      // Aquí iría la llamada a la API para guardar los datos
      console.log("Guardando información de la farmacia:", data)

      // Simulamos un retraso para mostrar el estado de carga
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Información guardada",
        description: "La información de la farmacia ha sido actualizada correctamente.",
      })
    } catch (error) {
      console.error("Error al guardar la información:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la información. Inténtelo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Farmacia</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="taxId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Fiscal</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
          {isSaving ? (
            <>Guardando...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}

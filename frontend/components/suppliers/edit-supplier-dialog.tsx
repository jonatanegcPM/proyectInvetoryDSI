"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SupplierForm } from "./supplier-form"
import type { EditSupplierDialogProps } from "@/types/suppliers"
import { useEffect, useState } from "react"

export function EditSupplierDialog({
  isOpen,
  onOpenChange,
  form,
  onChange,
  onSelectChange,
  onSubmit,
  isProcessing,
  categories,
}: EditSupplierDialogProps) {
  const [errors, setErrors] = useState<Record<string, string> | null>(null)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  // Validar el formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!form.name.trim()) newErrors.name = "El nombre es obligatorio"
    if (!form.contact.trim()) newErrors.contact = "El contacto es obligatorio"
    if (!form.email.trim()) newErrors.email = "El email es obligatorio"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Email inválido"
    if (!form.phone.trim()) newErrors.phone = "El teléfono es obligatorio"
    if (!form.category) newErrors.category = "La categoría es obligatoria"
    if (!form.status) newErrors.status = "El estado es obligatorio"
    if (!form.address.trim()) newErrors.address = "La dirección es obligatoria"

    setErrors(Object.keys(newErrors).length > 0 ? newErrors : null)
    return Object.keys(newErrors).length === 0
  }

  // Validar cuando cambian los valores, pero solo mostrar errores si ya se intentó enviar
  useEffect(() => {
    if (isOpen) validateForm()
  }, [form, isOpen])

  // Manejar el envío del formulario con validación
  const handleSubmit = () => {
    setAttemptedSubmit(true)
    if (validateForm()) {
      onSubmit()
    }
  }

  // Limpiar errores al cerrar
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      setErrors(null)
      setAttemptedSubmit(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Proveedor</DialogTitle>
          <DialogDescription>
            Modifique los detalles del proveedor. Haga clic en guardar cuando termine.
          </DialogDescription>
        </DialogHeader>
        <SupplierForm
          form={form}
          onChange={onChange}
          onSelectChange={onSelectChange}
          isProcessing={isProcessing}
          categories={categories}
          errors={errors}
          showValidation={attemptedSubmit}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

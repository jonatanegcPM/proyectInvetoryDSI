"use client"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CustomerForm } from "./customer-form"
import type { AddCustomerDialogProps } from "@/types/customers"
import { Loader2 } from "lucide-react"

// Modificar la definición de la función para incluir validationErrors
export function AddCustomerDialog({
  isOpen,
  onOpenChange,
  form,
  onChange,
  onSelectChange,
  onSubmit,
  isProcessing,
  validationErrors = {},
}: AddCustomerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Cliente</DialogTitle>
          <DialogDescription>Complete el formulario para registrar un nuevo cliente en el sistema.</DialogDescription>
        </DialogHeader>
        <CustomerForm
          form={form}
          onChange={onChange}
          onSelectChange={onSelectChange}
          isProcessing={isProcessing}
          validationErrors={validationErrors}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cliente"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

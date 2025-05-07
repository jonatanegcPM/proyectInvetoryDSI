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

export function EditSupplierDialog({
  isOpen,
  onOpenChange,
  form,
  onChange,
  onSelectChange,
  onSubmit,
  isProcessing,
}: EditSupplierDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open)
        // Si se está cerrando el diálogo, limpiar el proveedor seleccionado
        if (!open) {
          // Esta lógica se maneja en el componente principal
        }
      }}
    >
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Proveedor</DialogTitle>
          <DialogDescription>
            Modifique los detalles del proveedor. Haga clic en guardar cuando termine.
          </DialogDescription>
        </DialogHeader>
        <SupplierForm form={form} onChange={onChange} onSelectChange={onSelectChange} isProcessing={isProcessing} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button type="submit" onClick={onSubmit} disabled={isProcessing || !form.name || !form.email}>
            {isProcessing ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


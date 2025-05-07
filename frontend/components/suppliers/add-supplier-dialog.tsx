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
import { SupplierForm } from "./supplier-form"
import type { AddSupplierDialogProps } from "@/types/suppliers"

export function AddSupplierDialog({
  isOpen,
  onOpenChange,
  form,
  onChange,
  onSelectChange,
  onSubmit,
  isProcessing,
}: AddSupplierDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Proveedor</DialogTitle>
          <DialogDescription>
            Ingrese los detalles del nuevo proveedor. Haga clic en guardar cuando termine.
          </DialogDescription>
        </DialogHeader>
        <SupplierForm form={form} onChange={onChange} onSelectChange={onSelectChange} isProcessing={isProcessing} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button type="submit" onClick={onSubmit} disabled={isProcessing || !form.name || !form.email}>
            {isProcessing ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


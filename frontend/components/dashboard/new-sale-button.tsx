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

export function NewSaleButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva Venta</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nueva Venta</DialogTitle>
          <DialogDescription>Inicia una nueva transacción de venta.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>Esta funcionalidad te redirigirá al módulo de Punto de Venta.</p>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Ir a Punto de Venta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


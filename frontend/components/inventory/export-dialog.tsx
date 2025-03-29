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
import { FileDown } from "lucide-react"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (format: string) => void
  isSubmitting: boolean
}

export function ExportDialog({ open, onOpenChange, onExport, isSubmitting }: ExportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exportar Inventario</DialogTitle>
          <DialogDescription>Exporte su inventario en diferentes formatos.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Exportar inventario</h4>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onExport("csv")} disabled={isSubmitting}>
                <FileDown className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" onClick={() => onExport("excel")} disabled={isSubmitting}>
                <FileDown className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => onExport("pdf")} disabled={isSubmitting}>
                <FileDown className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


import { Building } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Building className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg font-medium">No se encontraron proveedores</p>
      <p className="text-sm text-muted-foreground">No hay proveedores que coincidan con los criterios de búsqueda.</p>
    </div>
  )
}


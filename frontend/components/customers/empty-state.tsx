import { Users } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Users className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg font-medium">No se encontraron clientes</p>
      <p className="text-sm text-muted-foreground">No hay clientes que coincidan con los criterios de búsqueda.</p>
    </div>
  )
}


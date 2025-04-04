import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function NewSaleButton() {
  return (
    <Button size="sm" className="flex items-center gap-2" asChild>
      <Link href="/point-of-sale">
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Nueva Venta</span>
      </Link>
    </Button>
  )
}


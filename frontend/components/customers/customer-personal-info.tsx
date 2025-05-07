import { Calendar, User, AlertTriangle } from "lucide-react"
import { formatDate } from "@/hooks/use-customers"
import type { Customer } from "@/types/customers"

interface CustomerPersonalInfoProps {
  customer: Customer
}

export function CustomerPersonalInfo({ customer }: CustomerPersonalInfoProps) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-2">Información Personal</h4>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Fecha de Nacimiento</p>
            <p className="text-sm">{formatDate(customer.dateOfBirth)}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <User className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Género</p>
            <p className="text-sm">{customer.gender}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Alergias</p>
            <p className="text-sm">
              {customer.allergies.length > 0 ? customer.allergies.join(", ") : "No reporta alergias"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


import { Mail, Phone, MapPin } from "lucide-react"
import type { Customer } from "@/types/customers"

interface CustomerContactInfoProps {
  customer: Customer
}

export function CustomerContactInfo({ customer }: CustomerContactInfoProps) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-2">Información de Contacto</h4>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm">{customer.email}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Teléfono</p>
            <p className="text-sm">{customer.phone}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Dirección</p>
            <p className="text-sm">{customer.address}</p>
          </div>
        </div>
      </div>
    </div>
  )
}


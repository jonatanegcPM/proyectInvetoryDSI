import { CreditCard, FileText } from "lucide-react"
import type { Customer } from "@/types/customers"

interface CustomerMedicalInfoProps {
  customer: Customer
}

export function CustomerMedicalInfo({ customer }: CustomerMedicalInfoProps) {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold mb-2">Información Médica</h4>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Seguro Médico</p>
            <p className="text-sm">{customer.insurance}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Notas</p>
            <p className="text-sm">{customer.notes}</p>
          </div>
        </div>
      </div>
    </div>
  )
}


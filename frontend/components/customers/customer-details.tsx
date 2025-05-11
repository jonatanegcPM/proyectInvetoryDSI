"use client"

import { X, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DialogFooter } from "@/components/ui/dialog"
import type { CustomerDetailsProps } from "@/types/customers"
import { formatDate } from "@/hooks/use-customers"
import { CustomerPersonalInfo } from "./customer-personal-info"
import { CustomerContactInfo } from "./customer-contact-info"
import { CustomerMedicalInfo } from "./customer-medical-info"
import { CustomerPurchases } from "./customer-purchases"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function CustomerDetails({
  customer,
  onClose,
  onEdit,
}: CustomerDetailsProps & {
  onClose: () => void
  onEdit: (customerId: string) => void
}) {
  if (!customer) return null

  const TruncatedText = ({ text, maxLength = 30 }: { text: string; maxLength?: number }) => {
    if (!text) return null

    if (text.length <= maxLength) return <span>{text}</span>

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="truncate block max-w-full" style={{ cursor: "help" }}>
              {text}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start" className="max-w-[300px] break-words">
            {text}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <>
      <div className="py-4">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl">{customer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold">
              <TruncatedText text={customer.name} maxLength={40} />
            </h3>
            <p className="text-sm text-muted-foreground">
              ID: {customer.id} • Cliente desde {formatDate(customer.registrationDate)}
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              customer.status === "active"
                ? "ml-auto bg-green-50 text-green-700 border-green-200"
                : "ml-auto bg-red-50 text-red-700 border-red-200"
            }
          >
            {customer.status === "active" ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <CustomerPersonalInfo customer={customer} />
          <CustomerContactInfo customer={customer} />
        </div>

        <CustomerMedicalInfo customer={customer} />

        <Tabs defaultValue="purchases">
          <TabsList className="mb-4">
            <TabsTrigger value="purchases">Compras</TabsTrigger>
          </TabsList>
          <TabsContent value="purchases">
            <CustomerPurchases purchases={customer.purchases} />
          </TabsContent>
        </Tabs>
      </div>
      <DialogFooter className="flex justify-between sm:justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          Cerrar
        </Button>
        <Button onClick={() => onEdit(customer.id)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </DialogFooter>
    </>
  )
}

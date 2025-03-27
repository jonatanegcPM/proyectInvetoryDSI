"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, DollarSign, ShoppingCart } from "lucide-react"
import type { PaymentMethodSelectorProps } from "@/types/point-of-sale"

export function PaymentMethodSelector({ paymentMethod, onPaymentMethodChange }: PaymentMethodSelectorProps) {
  return (
    <div className="w-full">
      <Label htmlFor="payment-method">Método de Pago</Label>
      <Select onValueChange={onPaymentMethodChange} value={paymentMethod || undefined} defaultValue={undefined}>
        <SelectTrigger id="payment-method">
          <SelectValue placeholder="Seleccionar método de pago" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cash">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Efectivo
            </div>
          </SelectItem>
          <SelectItem value="credit-card">
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Tarjeta de Crédito
            </div>
          </SelectItem>
          <SelectItem value="insurance">
            <div className="flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Seguro
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}


"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CustomerSelectorProps } from "@/types/point-of-sale"

export function CustomerSelector({ selectedCustomer, onCustomerSelect, customers }: CustomerSelectorProps) {
  return (
    <div className="w-full">
      <Label htmlFor="customer">Cliente</Label>
      <Select onValueChange={onCustomerSelect} value={selectedCustomer ? selectedCustomer.id.toString() : undefined}>
        <SelectTrigger id="customer">
          <SelectValue placeholder="Seleccionar cliente" />
        </SelectTrigger>
        <SelectContent>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id.toString()}>
              {customer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedCustomer && (
        <div className="w-full text-sm mt-2">
          <p>Email: {selectedCustomer.email}</p>
          <p>Phone: {selectedCustomer.phone}</p>
        </div>
      )}
    </div>
  )
}


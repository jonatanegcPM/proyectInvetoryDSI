"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SupplierFormProps } from "@/types/suppliers"
import { categories } from "@/hooks/use-suppliers"

export function SupplierForm({ form, onChange, onSelectChange, isProcessing }: SupplierFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            placeholder="Nombre del proveedor"
            value={form.name}
            onChange={onChange}
            disabled={isProcessing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">Contacto</Label>
          <Input
            id="contact"
            placeholder="Nombre del contacto"
            value={form.contact}
            onChange={onChange}
            disabled={isProcessing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={form.email}
            onChange={onChange}
            disabled={isProcessing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" placeholder="503-1234-5678" value={form.phone} onChange={onChange} disabled={isProcessing} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select
            value={form.category}
            onValueChange={(value) => onSelectChange("category", value)}
            disabled={isProcessing}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .filter((c) => c !== "Todos")
                .map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select
            value={form.status}
            onValueChange={(value) => onSelectChange("status", value as "active" | "inactive" | "pending")}
            disabled={isProcessing}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Textarea
          id="address"
          placeholder="Dirección completa"
          rows={2}
          value={form.address}
          onChange={onChange}
          disabled={isProcessing}
        />
      </div>
    </div>
  )
}


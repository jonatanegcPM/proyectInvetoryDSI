"use client"

import type React from "react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CustomerFormProps } from "@/types/customers"
import { useState, useEffect } from "react"

// Modificar la definición de la función para incluir validationErrors
export function CustomerForm({
  form,
  onChange,
  onSelectChange,
  isProcessing,
  validationErrors = {},
}: CustomerFormProps) {
  const [hasInsurance, setHasInsurance] = useState(form.insurance !== "")

  // Actualizar el estado cuando cambia el formulario externamente
  useEffect(() => {
    setHasInsurance(form.insurance !== "")
  }, [form.insurance])

  const handleInsuranceCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setHasInsurance(isChecked)

    if (!isChecked) {
      // Si se desmarca, vaciar el campo de seguro
      onChange({ target: { id: "insurance", value: "" } } as React.ChangeEvent<HTMLInputElement>)
    } else if (form.insurance === "") {
      // Si se marca y el campo está vacío, establecer un valor por defecto para activar el campo
      onChange({ target: { id: "insurance", value: "" } } as React.ChangeEvent<HTMLInputElement>)
    }
  }

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center">
            Nombre Completo <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Nombre y apellidos"
            value={form.name}
            onChange={onChange}
            disabled={isProcessing}
            className={validationErrors.name ? "border-red-500" : ""}
          />
          {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center">
            Email <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={form.email}
            onChange={onChange}
            disabled={isProcessing}
            className={validationErrors.email ? "border-red-500" : ""}
          />
          {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center">
            Teléfono <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="phone"
            placeholder="503-1234-5678"
            value={form.phone}
            onChange={onChange}
            disabled={isProcessing}
            className={validationErrors.phone ? "border-red-500" : ""}
          />
          {validationErrors.phone && <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="flex items-center">
            Fecha de Nacimiento <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={onChange}
            disabled={isProcessing}
            className={validationErrors.dateOfBirth ? "border-red-500" : ""}
            max={new Date().toISOString().split("T")[0]} // Limitar a la fecha actual
          />
          {validationErrors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{validationErrors.dateOfBirth}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender" className="flex items-center">
            Género <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={form.gender}
            onValueChange={(value) => onSelectChange("gender", value)}
            disabled={isProcessing}
          >
            <SelectTrigger id="gender" className={validationErrors.gender ? "border-red-500" : ""}>
              <SelectValue placeholder="Seleccionar género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Masculino">Masculino</SelectItem>
              <SelectItem value="Femenino">Femenino</SelectItem>
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.gender && <p className="text-red-500 text-xs mt-1">{validationErrors.gender}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="status" className="flex items-center">
            Estado <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={form.status}
            onValueChange={(value) => onSelectChange("status", value)}
            disabled={isProcessing}
          >
            <SelectTrigger id="status" className={validationErrors.status ? "border-red-500" : ""}>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.status && <p className="text-red-500 text-xs mt-1">{validationErrors.status}</p>}
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="insurance">Información de Seguro</Label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasInsurance"
              checked={hasInsurance}
              onChange={handleInsuranceCheckboxChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              disabled={isProcessing}
            />
            <Label htmlFor="hasInsurance" className="text-sm font-normal">
              Cliente tiene seguro
            </Label>
          </div>
        </div>
        <Input
          id="insurance"
          placeholder="Proveedor y número de póliza"
          value={form.insurance}
          onChange={onChange}
          disabled={isProcessing || !hasInsurance}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="allergies">Alergias</Label>
        <Textarea
          id="allergies"
          placeholder="Listar alergias separadas por comas"
          rows={2}
          value={form.allergies}
          onChange={onChange}
          disabled={isProcessing}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas Adicionales</Label>
        <Textarea
          id="notes"
          placeholder="Información adicional relevante"
          rows={2}
          value={form.notes}
          onChange={onChange}
          disabled={isProcessing}
        />
      </div>

      <div className="text-sm text-muted-foreground mt-2">
        <span className="text-red-500">*</span> Campos obligatorios
      </div>
    </div>
  )
}

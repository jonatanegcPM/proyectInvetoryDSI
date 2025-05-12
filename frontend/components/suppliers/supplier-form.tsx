"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SupplierFormProps } from "@/types/suppliers"
import { AlertCircle } from "lucide-react"

export function SupplierForm({
  form,
  onChange,
  onSelectChange,
  isProcessing,
  categories,
  errors,
  showValidation,
}: SupplierFormProps) {
  // Filtrar "Todos" de las categorías para el formulario
  const formCategories = categories.filter((cat) => cat !== "Todos")

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name" className="flex items-center">
            Nombre <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="name"
            value={form.name}
            onChange={onChange}
            disabled={isProcessing}
            className={showValidation && errors?.name ? "border-red-500 focus-visible:ring-red-500" : ""}
            required
          />
          {showValidation && errors?.name && (
            <p className="text-sm text-red-500 flex items-center mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.name}
            </p>
          )}
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="contact" className="flex items-center">
            Contacto Principal <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="contact"
            value={form.contact}
            onChange={onChange}
            disabled={isProcessing}
            className={showValidation && errors?.contact ? "border-red-500 focus-visible:ring-red-500" : ""}
            required
          />
          {showValidation && errors?.contact && (
            <p className="text-sm text-red-500 flex items-center mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.contact}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email" className="flex items-center">
            Email <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={onChange}
            disabled={isProcessing}
            className={showValidation && errors?.email ? "border-red-500 focus-visible:ring-red-500" : ""}
            required
          />
          {showValidation && errors?.email && (
            <p className="text-sm text-red-500 flex items-center mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.email}
            </p>
          )}
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="phone" className="flex items-center">
            Teléfono <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={onChange}
            disabled={isProcessing}
            className={showValidation && errors?.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
            required
          />
          {showValidation && errors?.phone && (
            <p className="text-sm text-red-500 flex items-center mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.phone}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="category" className="flex items-center">
            Categoría <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={form.category}
            onValueChange={(value) => onSelectChange("category", value)}
            disabled={isProcessing}
          >
            <SelectTrigger
              id="category"
              className={showValidation && errors?.category ? "border-red-500 focus-visible:ring-red-500" : ""}
            >
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {formCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showValidation && errors?.category && (
            <p className="text-sm text-red-500 flex items-center mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.category}
            </p>
          )}
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="status" className="flex items-center">
            Estado <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={form.status}
            onValueChange={(value) => onSelectChange("status", value as "active" | "inactive" | "pending")}
            disabled={isProcessing}
          >
            <SelectTrigger
              id="status"
              className={showValidation && errors?.status ? "border-red-500 focus-visible:ring-red-500" : ""}
            >
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
            </SelectContent>
          </Select>
          {showValidation && errors?.status && (
            <p className="text-sm text-red-500 flex items-center mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.status}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="address" className="flex items-center">
          Dirección <span className="text-red-500 ml-1">*</span>
        </Label>
        <Textarea
          id="address"
          value={form.address}
          onChange={onChange}
          disabled={isProcessing}
          className={showValidation && errors?.address ? "border-red-500 focus-visible:ring-red-500" : ""}
          required
        />
        {showValidation && errors?.address && (
          <p className="text-sm text-red-500 flex items-center mt-1">
            <AlertCircle className="h-3 w-3 mr-1" />
            {errors.address}
          </p>
        )}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        <p>
          Los campos marcados con <span className="text-red-500">*</span> son obligatorios
        </p>
      </div>
    </div>
  )
}

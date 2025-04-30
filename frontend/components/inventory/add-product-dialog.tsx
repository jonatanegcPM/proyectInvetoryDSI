"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
// Actualizar la interfaz para usar Category
import type { CreateProductDTO, Category } from "@/types/inventory"

interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  newProduct: CreateProductDTO
  setNewProduct: (product: CreateProductDTO) => void
  onSave: () => void
  isSubmitting: boolean
  categories: Category[]
}

interface ValidationErrors {
  [key: string]: string
}

export function AddProductDialog({
  open,
  onOpenChange,
  newProduct,
  setNewProduct,
  onSave,
  isSubmitting,
  categories,
}: AddProductDialogProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Reset errors and touched state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setErrors({})
      setTouched({})
    }
  }, [open])

  const validateField = (name: string, value: any) => {
    if (value === undefined || value === null || value === "") {
      return `Este campo es obligatorio`
    }

    if (name === "price" || name === "costPrice") {
      if (isNaN(Number(value)) || Number(value) <= 0) {
        return `Ingrese un valor numérico válido mayor que cero`
      }
    }

    if (name === "stock" || name === "reorderLevel") {
      if (isNaN(Number(value)) || Number(value) < 0) {
        return `Ingrese un valor numérico válido no negativo`
      }
    }

    return ""
  }

  const handleFieldChange = (name: string, value: any) => {
    // Mark field as touched
    setTouched((prev) => ({ ...prev, [name]: true }))

    // Update product data
    setNewProduct({ ...newProduct, [name]: value })

    // Validate and update errors
    const error = validateField(name, value)
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }

  const validateForm = () => {
    const newErrors: ValidationErrors = {}
    let isValid = true

    // Validate all fields
    const fieldsToValidate = [
      { name: "name", value: newProduct.name },
      { name: "sku", value: newProduct.sku },
      { name: "barcode", value: newProduct.barcode },
      { name: "categoryId", value: newProduct.categoryId },
      { name: "description", value: newProduct.description },
      { name: "stock", value: newProduct.stock },
      { name: "reorderLevel", value: newProduct.reorderLevel },
      { name: "price", value: newProduct.price },
      { name: "costPrice", value: newProduct.costPrice },
      { name: "supplierId", value: newProduct.supplierId },
      { name: "expiryDate", value: newProduct.expiryDate },
      { name: "location", value: newProduct.location },
    ]

    // Mark all fields as touched
    const newTouched: Record<string, boolean> = {}
    fieldsToValidate.forEach((field) => {
      newTouched[field.name] = true
      const error = validateField(field.name, field.value)
      if (error) {
        newErrors[field.name] = error
        isValid = false
      }
    })

    setTouched(newTouched)
    setErrors(newErrors)
    return isValid
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Producto</DialogTitle>
          <DialogDescription>
            Ingrese los detalles del nuevo producto. Todos los campos son obligatorios.
          </DialogDescription>
        </DialogHeader>

        {Object.keys(errors).length > 0 && Object.values(errors).some((error) => error !== "") && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Por favor complete todos los campos obligatorios correctamente.</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center">
                Nombre <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="name"
                value={newProduct.name || ""}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Nombre del producto"
                className={touched.name && errors.name ? "border-red-500" : ""}
              />
              {touched.name && errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku" className="flex items-center">
                SKU <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="sku"
                value={newProduct.sku || ""}
                onChange={(e) => handleFieldChange("sku", e.target.value)}
                placeholder="Código SKU"
                className={touched.sku && errors.sku ? "border-red-500" : ""}
              />
              {touched.sku && errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode" className="flex items-center">
                Código de Barras <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="barcode"
                value={newProduct.barcode || ""}
                onChange={(e) => handleFieldChange("barcode", e.target.value)}
                placeholder="Código de barras"
                className={touched.barcode && errors.barcode ? "border-red-500" : ""}
              />
              {touched.barcode && errors.barcode && <p className="text-red-500 text-xs mt-1">{errors.barcode}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center">
                Categoría <span className="text-red-500 ml-1">*</span>
              </Label>
              {/* Actualizar el componente Select para usar el nuevo formato de categorías */}
              <Select
                value={newProduct.categoryId?.toString() || ""}
                onValueChange={(value) => handleFieldChange("categoryId", value ? Number(value) : null)}
              >
                <SelectTrigger
                  id="category"
                  className={touched.categoryId && errors.categoryId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => c.name !== "Todos")
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id?.toString() || ""}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {touched.categoryId && errors.categoryId && (
                <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center">
                Descripción <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="description"
                value={newProduct.description || ""}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Descripción del producto"
                className={touched.description && errors.description ? "border-red-500" : ""}
              />
              {touched.description && errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier" className="flex items-center">
                Proveedor <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="supplier"
                value={newProduct.supplierId?.toString() || ""}
                onChange={(e) => handleFieldChange("supplierId", e.target.value ? Number(e.target.value) : null)}
                placeholder="ID del proveedor"
                className={touched.supplierId && errors.supplierId ? "border-red-500" : ""}
              />
              {touched.supplierId && errors.supplierId && (
                <p className="text-red-500 text-xs mt-1">{errors.supplierId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock" className="flex items-center">
                Stock Inicial <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                value={newProduct.stock || ""}
                onChange={(e) => handleFieldChange("stock", Number(e.target.value))}
                placeholder="Cantidad inicial"
                className={touched.stock && errors.stock ? "border-red-500" : ""}
              />
              {touched.stock && errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorderLevel" className="flex items-center">
                Nivel de Reorden <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="reorderLevel"
                type="number"
                value={newProduct.reorderLevel || ""}
                onChange={(e) => handleFieldChange("reorderLevel", e.target.value ? Number(e.target.value) : null)}
                placeholder="Nivel mínimo"
                className={touched.reorderLevel && errors.reorderLevel ? "border-red-500" : ""}
              />
              {touched.reorderLevel && errors.reorderLevel && (
                <p className="text-red-500 text-xs mt-1">{errors.reorderLevel}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center">
                Precio de Venta <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={newProduct.price || ""}
                onChange={(e) => handleFieldChange("price", Number(e.target.value))}
                placeholder="Precio de venta"
                className={touched.price && errors.price ? "border-red-500" : ""}
              />
              {touched.price && errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice" className="flex items-center">
                Precio de Costo <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                value={newProduct.costPrice || ""}
                onChange={(e) => handleFieldChange("costPrice", e.target.value ? Number(e.target.value) : null)}
                placeholder="Precio de costo"
                className={touched.costPrice && errors.costPrice ? "border-red-500" : ""}
              />
              {touched.costPrice && errors.costPrice && <p className="text-red-500 text-xs mt-1">{errors.costPrice}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="flex items-center">
                Fecha de Vencimiento <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={newProduct.expiryDate || ""}
                onChange={(e) => handleFieldChange("expiryDate", e.target.value)}
                className={touched.expiryDate && errors.expiryDate ? "border-red-500" : ""}
              />
              {touched.expiryDate && errors.expiryDate && (
                <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center">
                Ubicación <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="location"
                value={newProduct.location || ""}
                onChange={(e) => handleFieldChange("location", e.target.value)}
                placeholder="Ubicación en almacén"
                className={touched.location && errors.location ? "border-red-500" : ""}
              />
              {touched.location && errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

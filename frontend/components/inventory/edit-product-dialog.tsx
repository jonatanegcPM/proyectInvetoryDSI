"use client"

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
import { Save, Loader2 } from "lucide-react"
import type { Product, Category, Supplier } from "@/types/inventory"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

// interfaz de props 
interface EditProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  setProduct: (product: Product) => void
  onSave: () => void
  isSubmitting: boolean
  categories: Category[]
  suppliers: Supplier[]
}

// desestructuración de props
export function EditProductDialog({
  open,
  onOpenChange,
  product,
  setProduct,
  onSave,
  isSubmitting,
  categories,
  suppliers,
}: EditProductDialogProps) {
  const { toast } = useToast()
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Reset errors when dialog opens or product changes
    if (open && product) {
      setErrors({})
    }
  }, [open, product])

  if (!product) return null

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!product.name || product.name.trim() === "") {
      newErrors.name = "El nombre del producto es obligatorio"
    }

    if (!product.price || product.price <= 0) {
      newErrors.price = "El precio debe ser mayor que 0"
    }

    if (!product.sku || product.sku.trim() === "") {
      newErrors.sku = "El SKU es obligatorio"
    }

    if (!product.categoryId) {
      newErrors.category = "La categoría es obligatoria"
    }

    if (!product.description || product.description.trim() === "") {
      newErrors.description = "La descripción es obligatoria"
    }

    if (!product.supplierId) {
      newErrors.supplier = "El proveedor es obligatorio"
    }

    if (product.reorderLevel === null || product.reorderLevel === undefined) {
      newErrors.reorderLevel = "El nivel de reorden es obligatorio"
    } else if (product.reorderLevel < 0) {
      newErrors.reorderLevel = "El nivel de reorden no puede ser negativo"
    }

    if (product.costPrice === null || product.costPrice === undefined) {
      newErrors.costPrice = "El precio de costo es obligatorio"
    } else if (product.costPrice < 0) {
      newErrors.costPrice = "El precio de costo no puede ser negativo"
    }

    if (!product.location || product.location.trim() === "") {
      newErrors.location = "La ubicación es obligatoria"
    }

    // Barcode validation (if provided)
    if (product.barcode) {
      if (!/^[0-9]+$/.test(product.barcode)) {
        newErrors.barcode = "El código de barras debe contener solo números"
      }
    } else {
      newErrors.barcode = "El código de barras es obligatorio"
    }

    // Expiry date validation
    if (!product.expiryDate) {
      newErrors.expiryDate = "La fecha de vencimiento es obligatoria"
    } else {
      const expiryDate = new Date(product.expiryDate)
      const today = new Date()
      if (expiryDate < today) {
        newErrors.expiryDate = "La fecha de vencimiento no puede ser en el pasado"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave()
    } else {
      toast({
        title: "Error de validación",
        description: "Por favor, corrija los errores en el formulario",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>Modifique los detalles del producto y guarde los cambios.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className={errors.name ? "text-destructive" : ""}>
                Nombre*
              </Label>
              <Input
                id="edit-name"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sku" className={errors.sku ? "text-destructive" : ""}>
                SKU*
              </Label>
              <Input
                id="edit-sku"
                value={product.sku || ""}
                onChange={(e) => setProduct({ ...product, sku: e.target.value || null })}
                className={errors.sku ? "border-destructive" : ""}
              />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-barcode" className={errors.barcode ? "text-destructive" : ""}>
                Código de Barras*
              </Label>
              <Input
                id="edit-barcode"
                value={product.barcode || ""}
                onChange={(e) => setProduct({ ...product, barcode: e.target.value || null })}
                className={errors.barcode ? "border-destructive" : ""}
              />
              {errors.barcode && <p className="text-xs text-destructive">{errors.barcode}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category" className={errors.category ? "text-destructive" : ""}>
                Categoría*
              </Label>
              {/* Actualizar el componente Select para usar el nuevo formato de categorías */}
              <Select
                value={product.categoryId?.toString() || ""}
                onValueChange={(value) =>
                  setProduct({
                    ...product,
                    categoryId: value ? Number(value) : null,
                    category: value ? categories.find((cat) => cat.id === Number(value))?.name || null : null,
                  })
                }
              >
                <SelectTrigger id="edit-category" className={errors.category ? "border-destructive" : ""}>
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
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description" className={errors.description ? "text-destructive" : ""}>
                Descripción*
              </Label>
              <Textarea
                id="edit-description"
                value={product.description || ""}
                onChange={(e) => setProduct({ ...product, description: e.target.value || null })}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
            {/* Reemplazar el input de proveedor por un select */}
            <div className="space-y-2">
              <Label htmlFor="edit-supplier" className={errors.supplier ? "text-destructive" : ""}>
                Proveedor*
              </Label>
              <Select
                value={product.supplierId?.toString() || ""}
                onValueChange={(value) =>
                  setProduct({
                    ...product,
                    supplierId: value ? Number(value) : null,
                    supplier: value ? suppliers?.find((s) => s.id === Number(value))?.name || null : null,
                  })
                }
              >
                <SelectTrigger id="edit-supplier" className={errors.supplier ? "border-destructive" : ""}>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers && suppliers.length > 0 ? (
                    suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      Cargando proveedores...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.supplier && <p className="text-xs text-destructive">{errors.supplier}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reorderLevel" className={errors.reorderLevel ? "text-destructive" : ""}>
                Nivel de Reorden*
              </Label>
              <Input
                id="edit-reorderLevel"
                type="number"
                value={product.reorderLevel || ""}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    reorderLevel: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className={errors.reorderLevel ? "border-destructive" : ""}
              />
              {errors.reorderLevel && <p className="text-xs text-destructive">{errors.reorderLevel}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price" className={errors.price ? "text-destructive" : ""}>
                Precio de Venta*
              </Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-costPrice" className={errors.costPrice ? "text-destructive" : ""}>
                Precio de Costo*
              </Label>
              <Input
                id="edit-costPrice"
                type="number"
                step="0.01"
                value={product.costPrice || ""}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    costPrice: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className={errors.costPrice ? "border-destructive" : ""}
              />
              {errors.costPrice && <p className="text-xs text-destructive">{errors.costPrice}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expiryDate" className={errors.expiryDate ? "text-destructive" : ""}>
                Fecha de Vencimiento*
              </Label>
              <Input
                id="edit-expiryDate"
                type="date"
                value={product.expiryDate?.split("T")[0] || ""}
                onChange={(e) => setProduct({ ...product, expiryDate: e.target.value || null })}
                className={errors.expiryDate ? "border-destructive" : ""}
              />
              {errors.expiryDate && <p className="text-xs text-destructive">{errors.expiryDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location" className={errors.location ? "text-destructive" : ""}>
                Ubicación*
              </Label>
              <Input
                id="edit-location"
                value={product.location || ""}
                onChange={(e) => setProduct({ ...product, location: e.target.value || null })}
                className={errors.location ? "border-destructive" : ""}
              />
              {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
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
                Guardar Cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

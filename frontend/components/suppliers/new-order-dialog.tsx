"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { NewOrderDialogProps, SupplierProduct } from "@/types/suppliers"

export function NewOrderDialog({ isOpen, onOpenChange, supplier, onSubmit, isProcessing }: NewOrderDialogProps) {
  const [expectedDate, setExpectedDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días a partir de hoy
  )
  const [items, setItems] = useState([{ productId: "", productName: "", quantity: 1, price: 0 }])
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([])

  // Cargar productos del proveedor
  useEffect(() => {
    if (supplier) {
      // En una implementación real, aquí se cargarían los productos del proveedor desde la API
      // Por ahora, usamos datos de ejemplo
      const mockProducts: SupplierProduct[] = [
        { id: 1, name: "Amoxicillin 500mg", category: "Antibiotics", stock: 120, price: 15.99 },
        { id: 2, name: "Lisinopril 10mg", category: "Blood Pressure", stock: 85, price: 12.5 },
        { id: 3, name: "Metformin 500mg", category: "Diabetes", stock: 95, price: 8.75 },
        { id: 4, name: "Ibuprofen 200mg", category: "Pain Relief", stock: 150, price: 5.99 },
        { id: 5, name: "Omeprazole 20mg", category: "Heartburn", stock: 75, price: 18.25 },
      ]
      setSupplierProducts(mockProducts)
    }
  }, [supplier])

  // Calcular el total del pedido
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Función para agregar un nuevo item
  const addItem = () => {
    setItems([...items, { productId: "", productName: "", quantity: 1, price: 0 }])
  }

  // Función para eliminar un item
  const removeItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  // Función para actualizar un item
  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  // Función para manejar la selección de producto
  const handleProductSelect = (index: number, productId: string) => {
    const selectedProduct = supplierProducts.find((p) => p.id.toString() === productId)

    if (selectedProduct) {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        productId: productId,
        productName: selectedProduct.name,
        price: selectedProduct.price,
      }
      setItems(newItems)
    }
  }

  // Función para manejar el envío del formulario
  const handleSubmit = () => {
    if (!supplier) return

    const orderData = {
      supplierName: supplier.name,
      supplierId: supplier.id,
      expectedDate,
      items: items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
    }

    onSubmit(orderData)
  }

  // Función para resetear el formulario cuando se cierra el diálogo
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setExpectedDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
      setItems([{ productId: "", productName: "", quantity: 1, price: 0 }])
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Nuevo Pedido</DialogTitle>
          <DialogDescription>
            {supplier ? `Crear un nuevo pedido para ${supplier.name}` : "Seleccione un proveedor para crear un pedido"}
          </DialogDescription>
        </DialogHeader>

        {supplier && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="supplier">Proveedor</Label>
                <Input id="supplier" value={supplier.name} disabled />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="expected-date">Fecha Esperada de Entrega</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="expected-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expectedDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expectedDate ? format(expectedDate, "PPP") : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={expectedDate} onSelect={setExpectedDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Productos</Label>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label htmlFor={`product-${index}`} className="sr-only">
                        Producto
                      </Label>
                      <Select value={item.productId} onValueChange={(value) => handleProductSelect(index, value)}>
                        <SelectTrigger id={`product-${index}`}>
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {supplierProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} - ${product.price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-20">
                      <Label htmlFor={`quantity-${index}`} className="sr-only">
                        Cantidad
                      </Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="1"
                        placeholder="Cant."
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="w-24">
                      <Label htmlFor={`price-${index}`} className="sr-only">
                        Precio
                      </Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Precio"
                        value={item.price}
                        disabled
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar producto</span>
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Producto
              </Button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-sm font-medium">Total del Pedido:</div>
              <div className="text-lg font-bold">${total.toFixed(2)}</div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing || !supplier || items.some((item) => !item.productName)}
          >
            {isProcessing ? "Procesando..." : "Crear Pedido"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

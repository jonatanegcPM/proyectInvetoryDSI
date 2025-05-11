"use client"

import { useState, useEffect, useCallback } from "react"
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
import { AlertCircle, CalendarIcon, Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react"
import { format, isAfter, isBefore, addMonths, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Textarea } from "@/components/ui/textarea"
import type { NewOrderDialogProps, SupplierProduct } from "@/types/suppliers"
import type { CreatePurchaseDTO, PurchaseItemDTO } from "@/types/purchases"
import { SupplierService } from "@/services/supplier-service"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export function NewOrderDialog({ isOpen, onOpenChange, supplier, onSubmit, isProcessing }: NewOrderDialogProps) {
  const { toast } = useToast()
  const today = new Date()
  const maxDate = addMonths(today, 6) // Máximo 6 meses en el futuro

  const [expectedDate, setExpectedDate] = useState<Date | undefined>(
    addDays(today, 7), // 7 días a partir de hoy
  )
  const [dateError, setDateError] = useState<string | null>(null)
  const [items, setItems] = useState<Array<PurchaseItemDTO & { productName?: string }>>([
    { productId: 0, productName: "", quantity: 1, unitPrice: 0 },
  ])
  const [notes, setNotes] = useState("")
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerms, setSearchTerms] = useState<string[]>([])
  const [openProductSelector, setOpenProductSelector] = useState(-1)
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Cargar productos del proveedor
  const loadSupplierProducts = useCallback(async () => {
    if (!supplier) return

    setIsLoading(true)
    setError("")

    try {
      const response = await SupplierService.getSupplierProducts(supplier.id)
      setSupplierProducts(response.products)
    } catch (err) {
      console.error("Error loading supplier products:", err)
      setError("No se pudieron cargar los productos del proveedor")
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos del proveedor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [supplier, toast])

  useEffect(() => {
    if (supplier && isOpen) {
      // Resetear los items al abrir el diálogo
      setItems([{ productId: 0, productName: "", quantity: 1, unitPrice: 0 }])
      setSearchTerms([""])
      loadSupplierProducts()
    }
  }, [supplier, isOpen, loadSupplierProducts])

  // Validar fecha
  const validateDate = useCallback(
    (date: Date | undefined) => {
      if (!date) {
        setDateError("La fecha de entrega es obligatoria")
        return false
      }

      if (isBefore(date, today)) {
        setDateError("La fecha de entrega no puede ser en el pasado")
        return false
      }

      if (isAfter(date, maxDate)) {
        setDateError("La fecha de entrega no puede ser más de 6 meses en el futuro")
        return false
      }

      setDateError(null)
      return true
    },
    [today, maxDate],
  )

  // Validar fecha al cambiarla
  const handleDateChange = (date: Date | undefined) => {
    setExpectedDate(date)
    validateDate(date)
  }

  // Calcular el total del pedido
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const tax = subtotal * 0.13 // 13% de impuestos
    return {
      subtotal,
      tax,
      total: subtotal + tax,
    }
  }

  const { subtotal, tax, total } = calculateTotals()

  // Función para agregar un nuevo item
  const addItem = () => {
    setItems([...items, { productId: 0, productName: "", quantity: 1, unitPrice: 0 }])
    setSearchTerms([...searchTerms, ""])
  }

  // Función para eliminar un item
  const removeItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)

    const newSearchTerms = [...searchTerms]
    newSearchTerms.splice(index, 1)
    setSearchTerms(newSearchTerms)
  }

  // Función para actualizar un item
  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Si es un cambio de precio o cantidad, recalcular totales
    if (field === "unitPrice" || field === "quantity") {
      const numericValue = Number(value) || 0
      if (numericValue <= 0) {
        // Establecer un valor mínimo para evitar valores negativos o cero
        newItems[index][field] = field === "quantity" ? 1 : 0
      }
    }

    setItems(newItems)
  }

  // Función para manejar la búsqueda de productos
  const handleSearch = (value: string, index: number) => {
    const newSearchTerms = [...searchTerms]
    newSearchTerms[index] = value
    setSearchTerms(newSearchTerms)
  }

  // Verificar si un producto ya está en la lista
  const isProductAlreadyAdded = (productId: number) => {
    return items.some((item, idx) => item.productId === productId)
  }

  // Función para manejar la selección de producto
  const handleProductSelect = (index: number, product: SupplierProduct) => {
    // Verificar si el producto ya está en la lista (excepto en la posición actual)
    const isDuplicate = items.some((item, idx) => idx !== index && item.productId === product.id)

    if (isDuplicate) {
      toast({
        title: "Producto duplicado",
        description: `${product.name} ya está en la lista de productos`,
        variant: "destructive",
      })
      return
    }

    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      productId: product.id,
      productName: product.name,
      unitPrice: Number(product.price) || 0, // Asegurarse de que sea un número
    }
    setItems(newItems)
    setOpenProductSelector(-1)
  }

  // Validar el formulario completo
  const validateForm = () => {
    // Validar fecha
    if (!validateDate(expectedDate)) {
      return false
    }

    // Validar que haya al menos un producto
    if (items.length === 0 || !items.some((item) => item.productId > 0)) {
      setError("Debe agregar al menos un producto válido al pedido")
      return false
    }

    // Validar que todos los productos seleccionados tengan los datos necesarios
    const invalidItems = items.filter((item) => item.productId > 0 && (item.quantity <= 0 || item.unitPrice <= 0))

    if (invalidItems.length > 0) {
      setError("Todos los productos deben tener una cantidad y precio válidos")
      return false
    }

    // Verificar productos duplicados
    const productIds = items.map((item) => item.productId).filter((id) => id > 0)
    const uniqueProductIds = new Set(productIds)

    if (productIds.length !== uniqueProductIds.size) {
      setError("Hay productos duplicados en la lista")
      return false
    }

    setError("")
    return true
  }

  // Función para manejar el envío del formulario
  const handleSubmit = async () => {
    if (!supplier) return

    // Validar formulario
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Filtrar solo productos válidos y formatear datos para la API
      const validItems = items.filter((item) => item.productId > 0 && item.quantity > 0)

      // Preparar los datos del pedido con formato correcto
      const purchaseData: CreatePurchaseDTO = {
        supplierId: Number(supplier.id),
        // Formatear la fecha como "yyyy-MM-dd" para el backend (siempre debe tener un valor)
        expectedDeliveryDate: expectedDate ? format(expectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        items: validItems.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice) || 0,
        })),
        notes: notes.trim() || undefined,
      }

      if (purchaseData.items.length === 0) {
        throw new Error("Debe agregar al menos un producto válido al pedido")
      }

      console.log("Enviando pedido:", JSON.stringify(purchaseData, null, 2))

      // Pasar los datos al hook a través de onSubmit para evitar llamada duplicada
      onSubmit({
        ...purchaseData,
        supplierName: supplier.name,
      })

      // Limpiar estado local
      toast({
        title: "Procesando pedido",
        description: "El pedido se está procesando...",
      })
    } catch (err: any) {
      console.error("Error preparing purchase:", err)
      const errorMessage = err.message || "No se pudo preparar el pedido"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para resetear el formulario cuando se cierra el diálogo
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Resetear completamente todos los estados
      setExpectedDate(addDays(today, 7))
      setItems([{ productId: 0, productName: "", quantity: 1, unitPrice: 0 }])
      setNotes("")
      setError("")
      setSearchTerms([""])
      setDateError(null)
      setOpenProductSelector(-1)
      setCalendarOpen(false)

      // Añadir un pequeño retraso para asegurar que el estado se limpia después de que el diálogo se cierra
      setTimeout(() => {
        // Doble verificación para asegurar que los items están limpios
        setItems([{ productId: 0, productName: "", quantity: 1, unitPrice: 0 }])
      }, 100)
    }
    onOpenChange(open)
  }

  // Inicializar searchTerms si está vacío
  useEffect(() => {
    if (searchTerms.length === 0) {
      setSearchTerms(Array(items.length).fill(""))
    }
  }, [items.length, searchTerms.length])

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
                <Label htmlFor="expected-date" className={dateError ? "text-destructive" : ""}>
                  Fecha Esperada de Entrega*
                </Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="expected-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal transition-all",
                        !expectedDate && "text-muted-foreground",
                        dateError && "border-destructive text-destructive",
                        calendarOpen && "ring-2 ring-ring ring-offset-2",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expectedDate ? format(expectedDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b">
                      <h3 className="text-sm font-medium">Seleccione fecha de entrega</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Elija la fecha esperada para recibir este pedido
                      </p>
                    </div>
                    <Calendar
                      mode="single"
                      selected={expectedDate}
                      onSelect={(date) => {
                        handleDateChange(date)
                        setCalendarOpen(false)
                      }}
                      initialFocus
                      locale={es}
                      disabled={(date) => isBefore(date, today) || isAfter(date, maxDate)}
                      className="rounded-md border-0"
                      classNames={{
                        day_selected:
                          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-medium",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                        table: "w-full border-collapse space-y-1",
                      }}
                      footer={
                        <div className="p-3 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-center"
                            onClick={() => {
                              handleDateChange(addDays(today, 7))
                              setCalendarOpen(false)
                            }}
                          >
                            Usar fecha recomendada (7 días)
                          </Button>
                        </div>
                      }
                    />
                  </PopoverContent>
                </Popover>
                {dateError && <p className="text-xs text-destructive mt-1">{dateError}</p>}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Productos*</Label>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label htmlFor={`product-${index}`} className="sr-only">
                        Producto
                      </Label>
                      <Popover
                        open={openProductSelector === index}
                        onOpenChange={(open) => setOpenProductSelector(open ? index : -1)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openProductSelector === index}
                            className={cn(
                              "w-full justify-between",
                              !item.productId && items.length > 0 && "border-destructive",
                            )}
                          >
                            {item.productName ? item.productName : "Seleccionar producto"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Buscar producto..."
                              className="h-9"
                              value={searchTerms[index] || ""}
                              onValueChange={(value) => handleSearch(value, index)}
                            />
                            {isLoading ? (
                              <div className="py-6 text-center text-sm">Cargando productos...</div>
                            ) : (
                              <CommandList>
                                <CommandEmpty>No se encontraron productos</CommandEmpty>
                                <CommandGroup>
                                  {supplierProducts
                                    .filter(
                                      (product) =>
                                        !searchTerms[index] ||
                                        product.name.toLowerCase().includes((searchTerms[index] || "").toLowerCase()) ||
                                        product.category
                                          .toLowerCase()
                                          .includes((searchTerms[index] || "").toLowerCase()),
                                    )
                                    .map((product) => {
                                      // Verificar si el producto ya está en la lista (excepto en la posición actual)
                                      const isDuplicate = items.some(
                                        (item, idx) => idx !== index && item.productId === product.id,
                                      )

                                      return (
                                        <CommandItem
                                          key={product.id}
                                          value={product.id.toString()}
                                          onSelect={() => handleProductSelect(index, product)}
                                          disabled={isDuplicate}
                                          className={cn(isDuplicate && "opacity-50 cursor-not-allowed")}
                                        >
                                          <div className="flex flex-1 items-start flex-col">
                                            <div className="flex items-center w-full">
                                              <span className={isDuplicate ? "line-through" : ""}>{product.name}</span>
                                              {isDuplicate && (
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                  Ya agregado
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="flex items-center text-xs text-muted-foreground gap-2 mt-1">
                                              <Badge variant="outline" className="rounded-sm">
                                                {product.category}
                                              </Badge>
                                              <span>Stock: {product.stock}</span>
                                              <span className="font-medium">${product.price.toFixed(2)}</span>
                                            </div>
                                          </div>
                                          {item.productId === product.id && (
                                            <Check className="ml-auto h-4 w-4 text-primary" />
                                          )}
                                        </CommandItem>
                                      )
                                    })}
                                </CommandGroup>
                              </CommandList>
                            )}
                          </Command>
                        </PopoverContent>
                      </Popover>
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
                        className={item.quantity <= 0 ? "border-destructive" : ""}
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
                        value={item.unitPrice}
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
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Producto
              </Button>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Notas adicionales para este pedido"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Separator className="my-2" />

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="text-sm">Subtotal:</div>
                <div className="font-medium">${subtotal.toFixed(2)}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Impuestos (13%):</div>
                <div className="font-medium">${tax.toFixed(2)}</div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="text-sm font-medium">Total del Pedido:</div>
                <div className="text-lg font-bold">${total.toFixed(2)}</div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <p className="text-xs text-muted-foreground">* Campos obligatorios</p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              isProcessing ||
              isLoading ||
              !supplier ||
              items.some((item) => !item.productId) ||
              items.length === 0 ||
              !!dateError
            }
          >
            {isProcessing || isLoading ? "Procesando..." : "Crear Pedido"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

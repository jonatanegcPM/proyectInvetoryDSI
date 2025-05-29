"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

// Hooks personalizados
import { usePointOfSale } from "@/hooks/use-point-of-sale"

// Componentes
import { ProductScanner } from "@/components/point-of-sale/product-scanner"
import { ProductsTable } from "@/components/point-of-sale/products-table"
import { ShoppingCart } from "@/components/point-of-sale/shopping-cart"
import { ReceiptPrinter } from "@/components/point-of-sale/receipt-printer"
import { AddCustomerDialog } from "@/components/customers/add-customer-dialog"

import { CustomerService } from "@/services/customer-service"
import { toast } from "@/hooks/use-toast"
import { differenceInYears, isAfter, parseISO } from "date-fns"

interface Product {
  id: number
  name: string
  price: number
}

interface CartItem {
  product: Product
  quantity: number
}

const PointOfSale = () => {
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastSaleData, setLastSaleData] = useState<any>(null)

  // Estados para crear cliente rápido
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false)
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "Masculino",
    status: "active",
    address: "",
    insurance: "",
    allergies: "",
    notes: "",
  })
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  const {
    // Datos
    cart,
    selectedCustomer,
    paymentMethod,
    searchTerm,
    isScanning,
    scanMessage,
    scanError,
    isProcessing,
    isLoading,
    products,
    customers,

    // Funciones
    setSearchTerm,
    toggleScanning,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    setPaymentMethod,
    completeSale,
    handleCustomerSelect,
    selectCustomer,
    addCustomerToList,

    // Paginación
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    nextPage,
    prevPage,
    changeItemsPerPage,
    indexOfFirstItem,
    indexOfLastItem,
  } = usePointOfSale()

  // Función para manejar cambios en el formulario de cliente
  const handleCustomerFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target
    setCustomerForm({
      ...customerForm,
      [id]: value,
    })
  }

  // Función para manejar cambios en selects
  const handleCustomerSelectChange = (field: string, value: string) => {
    setCustomerForm({
      ...customerForm,
      [field]: value,
    })
  }

  // Función para validar el formulario de cliente
  const validateCustomerForm = (): boolean => {
    const errors: any = {}
    let isValid = true

    // Validar campos obligatorios
    if (!customerForm.name.trim()) {
      errors.name = "El nombre es obligatorio"
      isValid = false
    }

    if (!customerForm.email.trim()) {
      errors.email = "El email es obligatorio"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(customerForm.email)) {
      errors.email = "El formato del email no es válido"
      isValid = false
    }

    if (!customerForm.phone.trim()) {
      errors.phone = "El teléfono es obligatorio"
      isValid = false
    }

    if (!customerForm.dateOfBirth) {
      errors.dateOfBirth = "La fecha de nacimiento es obligatoria"
      isValid = false
    } else {
      const birthDate = parseISO(customerForm.dateOfBirth)
      const today = new Date()
      const age = differenceInYears(today, birthDate)

      if (isAfter(birthDate, today)) {
        errors.dateOfBirth = "La fecha no puede ser futura"
        isValid = false
      } else if (age < 18) {
        errors.dateOfBirth = "El cliente debe ser mayor de 18 años"
        isValid = false
      } else if (age > 120) {
        errors.dateOfBirth = "La fecha no parece válida"
        isValid = false
      }
    }

    if (!customerForm.gender) {
      errors.gender = "El género es obligatorio"
      isValid = false
    }

    if (!customerForm.status) {
      errors.status = "El estado es obligatorio"
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  // Función para crear cliente rápido
  const handleCreateCustomer = async () => {
    // Validar el formulario antes de procesar
    if (!validateCustomerForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, complete correctamente todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    setIsCreatingCustomer(true)

    try {
      // Crear el cliente usando el servicio real
      const newCustomer = await CustomerService.createCustomer(customerForm)

      // Mostrar notificación de éxito
      toast({
        title: "Cliente creado",
        description: `${customerForm.name} ha sido creado correctamente.`,
      })

      // Agregar el cliente a la lista local inmediatamente
      addCustomerToList(newCustomer)

      // Seleccionar automáticamente el cliente recién creado
      selectCustomer(newCustomer)

      // Resetear formulario y cerrar modal
      setCustomerForm({
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "Masculino",
        status: "active",
        address: "",
        insurance: "",
        allergies: "",
        notes: "",
      })
      setValidationErrors({})
      setIsAddCustomerDialogOpen(false)
    } catch (error) {
      console.error("Error creating customer:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el cliente. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingCustomer(false)
    }
  }

  // Handle sale completion and show receipt
  const handleCompleteSale = async () => {
    try {
      const saleResult = await completeSale()

      if (saleResult && saleResult.success) {
        // Prepare data for receipt
        setLastSaleData({
          saleId: saleResult.id || Math.floor(Math.random() * 100000), // Fallback to random ID if not provided
          date: new Date(),
          items: cart,
          customer: selectedCustomer,
          subtotal: Number.parseFloat(calculateTotal()) / 1.13, // Remove tax to get subtotal
          tax: Number.parseFloat(calculateTotal()) - Number.parseFloat(calculateTotal()) / 1.13,
          total: Number.parseFloat(calculateTotal()),
          paymentMethod: paymentMethod,
        })

        // Show receipt after successful sale
        setShowReceipt(true)
      }
    } catch (error) {
      console.error("Error completing sale:", error)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Scanner Card */}
      <ProductScanner
        isScanning={isScanning}
        scanMessage={scanMessage}
        scanError={scanError}
        toggleScanning={toggleScanning}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Search and List */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Productos</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ProductsTable
              products={products}
              onAddToCart={addToCart}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => (page > currentPage ? nextPage() : prevPage())}
              onItemsPerPageChange={changeItemsPerPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              startIndex={indexOfFirstItem}
              endIndex={indexOfLastItem}
              isLoading={isLoading}
              cart={cart} // Pass the cart to the products table
            />
          </CardContent>
        </Card>

        {/* Shopping Cart and Checkout */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Carrito de Compra</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddCustomerDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Cliente
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ShoppingCart
              cartItems={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
              total={calculateTotal()}
              selectedCustomer={selectedCustomer}
              onCustomerSelect={handleCustomerSelect}
              customers={customers}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onCompleteSale={handleCompleteSale}
              isProcessing={isProcessing}
            />
          </CardContent>
        </Card>
      </div>

      {/* Add Customer Dialog */}
      <AddCustomerDialog
        isOpen={isAddCustomerDialogOpen}
        onOpenChange={setIsAddCustomerDialogOpen}
        form={customerForm}
        onChange={handleCustomerFormChange}
        onSelectChange={handleCustomerSelectChange}
        onSubmit={handleCreateCustomer}
        isProcessing={isCreatingCustomer}
        validationErrors={validationErrors}
        showTrigger={false}
      />

      {/* Receipt Printer Modal */}
      {showReceipt && lastSaleData && (
        <ReceiptPrinter isOpen={showReceipt} onClose={() => setShowReceipt(false)} saleData={lastSaleData} />
      )}
    </div>
  )
}

export default PointOfSale

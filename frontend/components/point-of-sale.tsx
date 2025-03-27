"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Hooks personalizados
import { usePointOfSale } from "@/hooks/use-point-of-sale"

// Componentes
import { ProductScanner } from "@/components/point-of-sale/product-scanner"
import { ProductsTable } from "@/components/point-of-sale/products-table"
import { ShoppingCart } from "@/components/point-of-sale/shopping-cart"

export default function PointOfSale() {
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
    currentProducts,
    filteredProducts,
    customersData,

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

    // Paginación
    currentPage,
    itemsPerPage,
    totalPages,
    nextPage,
    prevPage,
    changeItemsPerPage,
    indexOfFirstItem,
    indexOfLastItem,
  } = usePointOfSale()

  return (
    <div className="flex flex-col gap-6">
      {/* Scanner Card */}
      <ProductScanner
        isScanning={isScanning}
        scanMessage={scanMessage}
        scanError={scanError}
        toggleScanning={toggleScanning}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Product Search and List */}
        <Card className="flex-1">
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
              products={currentProducts}
              onAddToCart={addToCart}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => (page > currentPage ? nextPage() : prevPage())}
              onItemsPerPageChange={changeItemsPerPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredProducts.length}
              startIndex={indexOfFirstItem}
              endIndex={indexOfLastItem}
            />
          </CardContent>
        </Card>

        {/* Shopping Cart and Checkout */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Carrito de Compra</CardTitle>
          </CardHeader>
          <CardContent>
            <ShoppingCart
              cartItems={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
              total={calculateTotal()}
              selectedCustomer={selectedCustomer}
              onCustomerSelect={handleCustomerSelect}
              customers={customersData}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onCompleteSale={completeSale}
              isProcessing={isProcessing}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


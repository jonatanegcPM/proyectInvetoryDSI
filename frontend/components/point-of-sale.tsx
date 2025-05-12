"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Hooks personalizados
import { usePointOfSale } from "@/hooks/use-point-of-sale"

// Componentes
import { ProductScanner } from "@/components/point-of-sale/product-scanner"
import { ProductsTable } from "@/components/point-of-sale/products-table"
import { ShoppingCart } from "@/components/point-of-sale/shopping-cart"
import { ReceiptPrinter } from "@/components/point-of-sale/receipt-printer"

export default function PointOfSale() {
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastSaleData, setLastSaleData] = useState<any>(null)

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
              customers={customers}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onCompleteSale={handleCompleteSale}
              isProcessing={isProcessing}
            />
          </CardContent>
        </Card>
      </div>

      {/* Receipt Printer Modal */}
      {showReceipt && lastSaleData && (
        <ReceiptPrinter isOpen={showReceipt} onClose={() => setShowReceipt(false)} saleData={lastSaleData} />
      )}
    </div>
  )
}

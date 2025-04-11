"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"
import { CardFooter } from "@/components/ui/card"
import { CustomerSelector } from "./customer-selector"
import { PaymentMethodSelector } from "./payment-method-selector"
import type { ShoppingCartProps } from "@/types/point-of-sale"

export function ShoppingCart({
  cartItems,
  onUpdateQuantity,
  onRemoveFromCart,
  total,
  selectedCustomer,
  onCustomerSelect,
  customers,
  paymentMethod,
  onPaymentMethodChange,
  onCompleteSale,
  isProcessing,
}: ShoppingCartProps) {
  const cart = cartItems
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cartItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                Tu carrito está vacío
              </TableCell>
            </TableRow>
          ) : (
            cartItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span>{item.quantity}</span>
                    <Button size="icon" variant="outline" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                <TableCell>
                  <Button size="sm" variant="destructive" onClick={() => onRemoveFromCart(item.id)}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <CardFooter className="flex-col items-start gap-4">
        <div className="flex flex-col w-full gap-1">
          <div className="flex justify-between w-full">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-full">
            <span className="text-muted-foreground">Impuesto (13%):</span>
            <span>${(cart.reduce((total, item) => total + item.price * item.quantity, 0) * 0.13).toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-full font-semibold">
            <span>Total:</span>
            <span>${total}</span>
          </div>
        </div>

        <CustomerSelector
          key={selectedCustomer ? `customer-${selectedCustomer.id}` : "no-customer"} 
          selectedCustomer={selectedCustomer}
          onCustomerSelect={onCustomerSelect}
          customers={customers}
        />

        <PaymentMethodSelector
          key={paymentMethod || "no-payment"} // Añadir key para forzar re-render
          paymentMethod={paymentMethod}
          onPaymentMethodChange={onPaymentMethodChange}
        />

        <Button
          className="w-full"
          size="lg"
          disabled={cartItems.length === 0 || !selectedCustomer || !paymentMethod || isProcessing}
          onClick={onCompleteSale}
        >
          {isProcessing ? "Procesando..." : "Completar Venta"}
        </Button>
      </CardFooter>
    </>
  )
}

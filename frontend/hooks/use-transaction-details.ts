"use client"

import { useState } from "react"
import type { Transaction, TransactionDetails, TransactionProduct } from "@/types/dashboard"

export function useTransactionDetails() {
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetails | null>(null)
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false)

  // Función para ver detalles de transacción
  const handleViewTransactionDetails = (transaction: Transaction) => {
    // Aquí es donde normalmente se haria una llamada a la API para obtener los detalles completos
    // Por ahora, simulamos los datos detallados

    // Calculamos el subtotal (84% del total para este ejemplo)
    const subtotal = Number.parseFloat((transaction.amount * 0.84).toFixed(2))
    const tax = Number.parseFloat((transaction.amount * 0.16).toFixed(2))

    // Generamos productos de ejemplo basados en el número de items
    const products: TransactionProduct[] = []

    if (transaction.items >= 1) {
      products.push({
        id: "P001",
        name: "Paracetamol 500mg",
        quantity: 2,
        unitPrice: 12.5,
        total: 25.0,
      })
    }

    if (transaction.items >= 2) {
      products.push({
        id: "P004",
        name: "Ibuprofeno 400mg",
        quantity: 1,
        unitPrice: 15.2,
        total: 15.2,
      })
    }

    if (transaction.items >= 3) {
      products.push({
        id: "P010",
        name: "Vitamina C 1000mg",
        quantity: 1,
        unitPrice: 38.3,
        total: 38.3,
      })
    }

    // Creamos el objeto de detalles de transacción
    const transactionDetails: TransactionDetails = {
      ...transaction,
      products,
      subtotal,
      tax,
    }

    setSelectedTransaction(transactionDetails)
    setIsTransactionDetailsOpen(true)
  }

  return {
    selectedTransaction,
    setSelectedTransaction,
    isTransactionDetailsOpen,
    setIsTransactionDetailsOpen,
    handleViewTransactionDetails,
  }
}


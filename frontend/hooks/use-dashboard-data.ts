"use client"

import { useState, useEffect } from "react"
import type { Transaction, InventoryItem } from "@/types/dashboard"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"

// Datos de ejemplo para transacciones
const transactionsData: Transaction[] = [
  { id: "TX-7829", customer: "María González", items: 3, amount: 78.5, status: "completed", date: "2023-03-15" },
  { id: "TX-7828", customer: "Juan Pérez", items: 1, amount: 125.0, status: "completed", date: "2023-03-15" },
  { id: "TX-7827", customer: "Ana Martínez", items: 5, amount: 210.75, status: "completed", date: "2023-03-14" },
  { id: "TX-7826", customer: "Carlos Rodríguez", items: 2, amount: 45.2, status: "pending", date: "2023-03-14" },
  { id: "TX-7825", customer: "Laura Sánchez", items: 4, amount: 132.6, status: "completed", date: "2023-03-13" },
  { id: "TX-7824", customer: "Pedro Gómez", items: 2, amount: 67.3, status: "completed", date: "2023-03-13" },
  { id: "TX-7823", customer: "Sofía Ramírez", items: 3, amount: 98.45, status: "cancelled", date: "2023-03-12" },
  { id: "TX-7822", customer: "Miguel Torres", items: 1, amount: 35.2, status: "completed", date: "2023-03-12" },
  { id: "TX-7821", customer: "Lucía Flores", items: 6, amount: 245.8, status: "completed", date: "2023-03-11" },
  { id: "TX-7820", customer: "Javier Díaz", items: 2, amount: 87.9, status: "pending", date: "2023-03-11" },
  { id: "TX-7819", customer: "Carmen López", items: 4, amount: 156.4, status: "completed", date: "2023-03-10" },
  { id: "TX-7818", customer: "Roberto Sánchez", items: 3, amount: 112.3, status: "completed", date: "2023-03-10" },
  { id: "TX-7817", customer: "Elena Martín", items: 2, amount: 65.75, status: "completed", date: "2023-03-09" },
  { id: "TX-7816", customer: "Daniel García", items: 5, amount: 198.6, status: "pending", date: "2023-03-09" },
  { id: "TX-7815", customer: "Isabel Rodríguez", items: 1, amount: 42.3, status: "completed", date: "2023-03-08" },
]

// Datos de ejemplo para inventario
const inventoryData: InventoryItem[] = [
  { id: "P001", name: "Paracetamol 500mg", category: "Analgésicos", currentStock: 5, minStock: 20, status: "critical" },
  { id: "P002", name: "Amoxicilina 250mg", category: "Antibióticos", currentStock: 12, minStock: 15, status: "low" },
  { id: "P003", name: "Loratadina 10mg", category: "Antialérgicos", currentStock: 8, minStock: 10, status: "low" },
  {
    id: "P004",
    name: "Ibuprofeno 400mg",
    category: "Antiinflamatorios",
    currentStock: 7,
    minStock: 15,
    status: "critical",
  },
  { id: "P005", name: "Omeprazol 20mg", category: "Antiácidos", currentStock: 3, minStock: 10, status: "critical" },
  { id: "P006", name: "Aspirina 100mg", category: "Analgésicos", currentStock: 18, minStock: 15, status: "normal" },
  { id: "P007", name: "Diclofenaco 50mg", category: "Antiinflamatorios", currentStock: 9, minStock: 12, status: "low" },
  { id: "P008", name: "Cetirizina 10mg", category: "Antialérgicos", currentStock: 14, minStock: 10, status: "normal" },
  { id: "P009", name: "Ranitidina 150mg", category: "Antiácidos", currentStock: 6, minStock: 10, status: "low" },
  { id: "P010", name: "Vitamina C 1000mg", category: "Vitaminas", currentStock: 22, minStock: 15, status: "normal" },
]

export function useDashboardData() {
  // Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all")

  // Estados para paginación de transacciones
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1)
  const [transactionsPerPage, setTransactionsPerPage] = useState(5)

  // Estados para paginación de inventario
  const [currentInventoryPage, setCurrentInventoryPage] = useState(1)
  const [inventoryPerPage, setInventoryPerPage] = useState(5)

  // Filtrar transacciones por fecha
  const filteredTransactions = transactionsData.filter((transaction) => {
    const transactionDate = new Date(transaction.date)
    const today = new Date()

    if (dateFilter === "today") {
      return format(transactionDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
    } else if (dateFilter === "week") {
      const weekStart = startOfWeek(today, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
      return transactionDate >= weekStart && transactionDate <= weekEnd
    } else if (dateFilter === "month") {
      const monthStart = startOfMonth(today)
      const monthEnd = endOfMonth(today)
      return transactionDate >= monthStart && transactionDate <= monthEnd
    }

    return true
  })

  // Filtrar por término de búsqueda
  const searchedTransactions = filteredTransactions.filter(
    (transaction) =>
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const searchedInventory = inventoryData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Paginación de transacciones
  const indexOfLastTransaction = currentTransactionPage * transactionsPerPage
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage
  const currentTransactions = searchedTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction)
  const totalTransactionPages = Math.ceil(searchedTransactions.length / transactionsPerPage)

  // Paginación de inventario
  const indexOfLastInventoryItem = currentInventoryPage * inventoryPerPage
  const indexOfFirstInventoryItem = indexOfLastInventoryItem - inventoryPerPage
  const currentInventory = searchedInventory.slice(indexOfFirstInventoryItem, indexOfLastInventoryItem)
  const totalInventoryPages = Math.ceil(searchedInventory.length / inventoryPerPage)

  // Cambiar página de transacciones
  const nextTransactionPage = () => {
    if (currentTransactionPage < totalTransactionPages) {
      setCurrentTransactionPage(currentTransactionPage + 1)
    }
  }

  const prevTransactionPage = () => {
    if (currentTransactionPage > 1) {
      setCurrentTransactionPage(currentTransactionPage - 1)
    }
  }

  const goToTransactionPage = (page: number) => {
    if (page >= 1 && page <= totalTransactionPages) {
      setCurrentTransactionPage(page)
    }
  }

  // Cambiar página de inventario
  const nextInventoryPage = () => {
    if (currentInventoryPage < totalInventoryPages) {
      setCurrentInventoryPage(currentInventoryPage + 1)
    }
  }

  const prevInventoryPage = () => {
    if (currentInventoryPage > 1) {
      setCurrentInventoryPage(currentInventoryPage - 1)
    }
  }

  const goToInventoryPage = (page: number) => {
    if (page >= 1 && page <= totalInventoryPages) {
      setCurrentInventoryPage(page)
    }
  }

  // Resetear paginación cuando cambia el filtro o la búsqueda
  useEffect(() => {
    setCurrentTransactionPage(1)
    setCurrentInventoryPage(1)
  }, [searchTerm, dateFilter])

  return {
    // Datos
    transactionsData,
    inventoryData,
    currentTransactions,
    currentInventory,
    searchedTransactions,
    searchedInventory,

    // Estados
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,

    // Paginación de transacciones
    currentTransactionPage,
    setCurrentTransactionPage,
    transactionsPerPage,
    setTransactionsPerPage,
    totalTransactionPages,
    indexOfFirstTransaction,
    indexOfLastTransaction,
    nextTransactionPage,
    prevTransactionPage,
    goToTransactionPage,

    // Paginación de inventario
    currentInventoryPage,
    setCurrentInventoryPage,
    inventoryPerPage,
    setInventoryPerPage,
    totalInventoryPages,
    indexOfFirstInventoryItem,
    indexOfLastInventoryItem,
    nextInventoryPage,
    prevInventoryPage,
    goToInventoryPage,
  }
}


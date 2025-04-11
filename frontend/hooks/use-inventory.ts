"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import type {
  Product,
  InventoryTransaction,
  NewProduct,
  AdjustmentData,
  SortConfig,
  InventoryStats,
} from "@/types/inventory"
import { normalizeSearchString } from "@/lib/utils"

// Datos de ejemplo para productos
const productsData: Product[] = [
  {
    id: 1,
    name: "Amoxicilina 500mg",
    sku: "MED-1234",
    barcode: "7501234567890",
    category: "Antibióticos",
    description: "Cápsulas, 30 unidades",
    stock: 42,
    reorderLevel: 20,
    price: 15.99,
    costPrice: 8.5,
    supplier: "Distribuidora MediFarma",
    expiryDate: "2025-06-15",
    location: "Estante A-1",
    lastUpdated: "2023-05-10",
    status: "in-stock",
  },
  {
    id: 2,
    name: "Lisinopril 10mg",
    sku: "MED-2345",
    barcode: "7501234567891",
    category: "Presión Arterial",
    description: "Tabletas, 90 unidades",
    stock: 8,
    reorderLevel: 15,
    price: 12.5,
    costPrice: 6.25,
    supplier: "Soluciones Farmacéuticas Globales",
    expiryDate: "2024-12-20",
    location: "Estante B-3",
    lastUpdated: "2023-05-12",
    status: "low-stock",
  },
  {
    id: 3,
    name: "Metformina 500mg",
    sku: "MED-3456",
    barcode: "7501234567892",
    category: "Diabetes",
    description: "Tabletas, 60 unidades",
    stock: 35,
    reorderLevel: 20,
    price: 8.75,
    costPrice: 4.3,
    supplier: "Suministros Médicos S.A.",
    expiryDate: "2025-03-10",
    location: "Estante A-4",
    lastUpdated: "2023-05-08",
    status: "in-stock",
  },
  {
    id: 4,
    name: "Ibuprofeno 200mg",
    sku: "MED-4567",
    barcode: "7501234567893",
    category: "Analgésicos",
    description: "Tabletas, 100 unidades",
    stock: 50,
    reorderLevel: 25,
    price: 5.99,
    costPrice: 2.8,
    supplier: "Distribuidora MediFarma",
    expiryDate: "2025-08-22",
    location: "Estante C-2",
    lastUpdated: "2023-05-15",
    status: "in-stock",
  },
  {
    id: 5,
    name: "Omeprazol 20mg",
    sku: "MED-5678",
    barcode: "7501234567894",
    category: "Antiácidos",
    description: "Cápsulas, 30 unidades",
    stock: 12,
    reorderLevel: 15,
    price: 18.25,
    costPrice: 9.15,
    supplier: "Soluciones Farmacéuticas Globales",
    expiryDate: "2024-09-18",
    location: "Estante B-1",
    lastUpdated: "2023-05-11",
    status: "medium-stock",
  },
  {
    id: 6,
    name: "Atorvastatina 20mg",
    sku: "MED-6789",
    barcode: "7501234567895",
    category: "Colesterol",
    description: "Tabletas, 30 unidades",
    stock: 18,
    reorderLevel: 15,
    price: 22.5,
    costPrice: 11.25,
    supplier: "Suministros Médicos S.A.",
    expiryDate: "2025-02-28",
    location: "Estante A-2",
    lastUpdated: "2023-05-09",
    status: "in-stock",
  },
  {
    id: 7,
    name: "Levotiroxina 50mcg",
    sku: "MED-7890",
    barcode: "7501234567896",
    category: "Tiroides",
    description: "Tabletas, 90 unidades",
    stock: 5,
    reorderLevel: 10,
    price: 14.75,
    costPrice: 7.35,
    supplier: "Distribuidora MediFarma",
    expiryDate: "2024-11-15",
    location: "Estante D-1",
    lastUpdated: "2023-05-14",
    status: "low-stock",
  },
  {
    id: 8,
    name: "Inhalador de Albuterol",
    sku: "MED-8901",
    barcode: "7501234567897",
    category: "Respiratorio",
    description: "Inhalador, 200 dosis",
    stock: 15,
    reorderLevel: 10,
    price: 45.99,
    costPrice: 28.5,
    supplier: "Soluciones Farmacéuticas Globales",
    expiryDate: "2025-01-10",
    location: "Estante C-3",
    lastUpdated: "2023-05-07",
    status: "in-stock",
  },
  {
    id: 9,
    name: "Sertralina 50mg",
    sku: "MED-9012",
    barcode: "7501234567898",
    category: "Antidepresivos",
    description: "Tabletas, 30 unidades",
    stock: 22,
    reorderLevel: 15,
    price: 16.5,
    costPrice: 8.25,
    supplier: "Suministros Médicos S.A.",
    expiryDate: "2025-04-20",
    location: "Estante B-4",
    lastUpdated: "2023-05-13",
    status: "in-stock",
  },
  {
    id: 10,
    name: "Prednisona 10mg",
    sku: "MED-0123",
    barcode: "7501234567899",
    category: "Antiinflamatorios",
    description: "Tabletas, 30 unidades",
    stock: 3,
    reorderLevel: 10,
    price: 12.99,
    costPrice: 6.5,
    supplier: "Distribuidora MediFarma",
    expiryDate: "2024-10-05",
    location: "Estante D-2",
    lastUpdated: "2023-05-16",
    status: "low-stock",
  },
  {
    id: 11,
    name: "Loratadina 10mg",
    sku: "MED-1235",
    barcode: "7501234567810",
    category: "Antialérgicos",
    description: "Tabletas, 20 unidades",
    stock: 28,
    reorderLevel: 15,
    price: 8.99,
    costPrice: 4.5,
    supplier: "Distribuidora MediFarma",
    expiryDate: "2025-07-12",
    location: "Estante E-1",
    lastUpdated: "2023-05-18",
    status: "in-stock",
  },
  {
    id: 12,
    name: "Paracetamol 500mg",
    sku: "MED-2346",
    barcode: "7501234567811",
    category: "Analgésicos",
    description: "Tabletas, 50 unidades",
    stock: 60,
    reorderLevel: 30,
    price: 4.99,
    costPrice: 2.1,
    supplier: "Suministros Médicos S.A.",
    expiryDate: "2025-09-30",
    location: "Estante C-1",
    lastUpdated: "2023-05-20",
    status: "in-stock",
  },
]

// Datos de ejemplo para transacciones de inventario
const inventoryTransactionsData: InventoryTransaction[] = [
  {
    id: 1,
    date: "2023-05-16",
    type: "Recepción",
    product: "Amoxicilina 500mg",
    quantity: 50,
    user: "Dra. Laura Sánchez",
    notes: "Entrega programada del proveedor",
  },
  {
    id: 2,
    date: "2023-05-15",
    type: "Venta",
    product: "Lisinopril 10mg",
    quantity: -2,
    user: "Dra. Laura Sánchez",
    notes: "Venta en punto de venta",
  },
  {
    id: 3,
    date: "2023-05-15",
    type: "Venta",
    product: "Metformina 500mg",
    quantity: -1,
    user: "Dra. Laura Sánchez",
    notes: "Venta en punto de venta",
  },
  {
    id: 4,
    date: "2023-05-14",
    type: "Ajuste",
    product: "Ibuprofeno 200mg",
    quantity: -5,
    user: "Dra. Laura Sánchez",
    notes: "Ajuste por inventario físico",
  },
  {
    id: 5,
    date: "2023-05-13",
    type: "Recepción",
    product: "Omeprazol 20mg",
    quantity: 25,
    user: "Dra. Laura Sánchez",
    notes: "Entrega de emergencia",
  },
  {
    id: 6,
    date: "2023-05-12",
    type: "Ajuste",
    product: "Atorvastatina 20mg",
    quantity: -2,
    user: "Dr. Carlos Rodríguez",
    notes: "Producto dañado",
  },
  {
    id: 7,
    date: "2023-05-11",
    type: "Venta",
    product: "Levotiroxina 50mcg",
    quantity: -3,
    user: "Dra. Laura Sánchez",
    notes: "Venta en punto de venta",
  },
  {
    id: 8,
    date: "2023-05-10",
    type: "Recepción",
    product: "Inhalador de Albuterol",
    quantity: 10,
    user: "Dr. Carlos Rodríguez",
    notes: "Entrega programada del proveedor",
  },
]

// Categorías de productos
export const categories = [
  "Todos",
  "Antibióticos",
  "Presión Arterial",
  "Diabetes",
  "Analgésicos",
  "Antiácidos",
  "Colesterol",
  "Tiroides",
  "Respiratorio",
  "Antidepresivos",
  "Antiinflamatorios",
  "Antialérgicos",
]

// Lista de proveedores
export const suppliers = [
  "Distribuidora MediFarma",
  "Suministros Médicos S.A.",
  "Soluciones Farmacéuticas Globales",
  "Farmacéutica Nacional",
  "Importadora Médica Internacional",
]

// Tipos de transacciones
export const transactionTypes = ["Recepción", "Venta", "Ajuste", "Devolución", "Transferencia"]

export function useInventory() {
  // Estados para la gestión de la interfaz
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "ascending" })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    description: "",
    stock: 0,
    reorderLevel: 0,
    price: 0,
    costPrice: 0,
    supplier: "",
    expiryDate: "",
    location: "",
  })
  const [adjustmentData, setAdjustmentData] = useState<AdjustmentData>({
    quantity: 0,
    type: "Ajuste",
    notes: "",
  })
  const [isImportExportOpen, setIsImportExportOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [selectedProductHistory, setSelectedProductHistory] = useState<Product | null>(null)
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1)
  const [transactionsPerPage, setTransactionsPerPage] = useState(10)

  // Hook para mostrar notificaciones
  const { toast } = useToast()

  // Filtrar productos por búsqueda y categoría
  const filteredProducts = productsData.filter((product) => {
    const matchesSearch =
      normalizeSearchString(product.name).includes(normalizeSearchString(searchTerm)) ||
      normalizeSearchString(product.sku).includes(normalizeSearchString(searchTerm)) ||
      normalizeSearchString(product.supplier).includes(normalizeSearchString(searchTerm)) ||
      (product.barcode && product.barcode.includes(searchTerm))

    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Ordenar productos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig.key) return 0

    if (a[sortConfig.key as keyof Product] < b[sortConfig.key as keyof Product]) {
      return sortConfig.direction === "ascending" ? -1 : 1
    }
    if (a[sortConfig.key as keyof Product] > b[sortConfig.key as keyof Product]) {
      return sortConfig.direction === "ascending" ? 1 : -1
    }
    return 0
  })

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)

  // Paginación para transacciones
  const indexOfLastTransaction = currentTransactionPage * transactionsPerPage
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage
  const currentTransactions = inventoryTransactionsData.slice(indexOfFirstTransaction, indexOfLastTransaction)
  const totalTransactionPages = Math.ceil(inventoryTransactionsData.length / transactionsPerPage)

  // Función para cambiar el orden
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Estadísticas de inventario
  const stats: InventoryStats = {
    totalProducts: productsData.length,
    lowStockProducts: productsData.filter((p) => p.status === "low-stock").length,
    totalValue: productsData.reduce((sum, product) => sum + product.price * product.stock, 0),
    expiringProducts: productsData.filter((p) => {
      const expiryDate = new Date(p.expiryDate)
      const threeMonthsFromNow = new Date()
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
      return expiryDate <= threeMonthsFromNow
    }).length,
  }

  // Funciones para gestionar productos
  const handleAddProduct = () => {
    setIsSubmitting(true)

    // Simulación de llamada a API
    setTimeout(() => {
      // En producción, aquí iría la llamada a la API
      // const response = await fetch('/api/products', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newProduct)
      // });

      setIsSubmitting(false)
      setIsAddDialogOpen(false)

      // Resetear el formulario
      setNewProduct({
        name: "",
        sku: "",
        barcode: "",
        category: "",
        description: "",
        stock: 0,
        reorderLevel: 0,
        price: 0,
        costPrice: 0,
        supplier: "",
        expiryDate: "",
        location: "",
      })

      toast({
        title: "Producto agregado",
        description: "El producto ha sido agregado correctamente.",
        variant: "success",
      })
    }, 1000)
  }

  const handleEditProduct = () => {
    setIsSubmitting(true)

    // Simulación de llamada a API
    setTimeout(() => {
      // En producción, aquí iría la llamada a la API
      // const response = await fetch(`/api/products/${productToEdit.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(productToEdit)
      // });

      setIsSubmitting(false)
      setIsEditDialogOpen(false)

      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado correctamente.",
        variant: "success",
      })
    }, 1000)
  }

  const handleDeleteProduct = () => {
    setIsSubmitting(true)

    // Simulación de llamada a API
    setTimeout(() => {
      // En producción, aquí iría la llamada a la API
      // const response = await fetch(`/api/products/${productToDelete.id}`, {
      //   method: 'DELETE'
      // });

      setIsSubmitting(false)
      setIsDeleteDialogOpen(false)
      setProductToDelete(null) // Asegurar que se limpie el estado

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente.",
        variant: "success",
      })
    }, 1000)
  }

  const handleAdjustStock = () => {
    setIsSubmitting(true)

    // Simulación de llamada a API
    setTimeout(() => {
      // En producción, aquí iría la llamada a la API
      // const response = await fetch(`/api/inventory/adjust`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     productId: productToAdjust.id,
      //     ...adjustmentData
      //   })
      // });

      setIsSubmitting(false)
      setIsAdjustDialogOpen(false)

      // Resetear el formulario
      setAdjustmentData({
        quantity: 0,
        type: "Ajuste",
        notes: "",
      })

      toast({
        title: "Stock ajustado",
        description: "El stock del producto ha sido ajustado correctamente.",
        variant: "success",
      })
    }, 1000)
  }

  // Función para cargar datos (simulación)
  const loadData = () => {
    setIsLoading(true)

    // Simulación de carga de datos
    setTimeout(() => {
      // En producción, aquí iría la llamada a la API
      // const response = await fetch('/api/products');
      // const data = await response.json();
      // setProducts(data);

      setIsLoading(false)
    }, 1000)
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData()
  }, [])

  // Función para exportar inventario
  const handleExportInventory = (format: string) => {
    setIsSubmitting(true)

    // Simulación de exportación
    setTimeout(() => {
      setIsSubmitting(false)
      setIsImportExportOpen(false)

      toast({
        title: "Inventario exportado",
        description: `El inventario ha sido exportado en formato ${format.toUpperCase()}.`,
        variant: "success",
      })
    }, 1000)
  }

  // Función para importar inventario
  const handleImportInventory = () => {
    setIsSubmitting(true)

    // Simulación de importación
    setTimeout(() => {
      setIsSubmitting(false)
      setIsImportExportOpen(false)

      toast({
        title: "Inventario importado",
        description: "El inventario ha sido importado correctamente.",
        variant: "success",
      })
    }, 1000)
  }

  // Función para obtener el historial de un producto
  const getProductHistory = (product: Product) => {
    return inventoryTransactionsData.filter((transaction) => transaction.product === product.name)
  }

  return {
    // Estado
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedProduct,
    setSelectedProduct,
    productToEdit,
    setProductToEdit,
    productToDelete,
    setProductToDelete,
    productToAdjust,
    setProductToAdjust,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isAdjustDialogOpen,
    setIsAdjustDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isLoading,
    isSubmitting,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    newProduct,
    setNewProduct,
    adjustmentData,
    setAdjustmentData,
    isImportExportOpen,
    setIsImportExportOpen,
    isHistoryDialogOpen,
    setIsHistoryDialogOpen,
    selectedProductHistory,
    setSelectedProductHistory,
    currentTransactionPage,
    setCurrentTransactionPage,
    transactionsPerPage,
    setTransactionsPerPage,

    // Datos procesados
    filteredProducts,
    sortedProducts,
    currentItems,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    currentTransactions,
    totalTransactionPages,
    indexOfFirstTransaction,
    indexOfLastTransaction,
    stats,

    // Funciones
    requestSort,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleAdjustStock,
    handleExportInventory,
    handleImportInventory,
    getProductHistory,
  }
}


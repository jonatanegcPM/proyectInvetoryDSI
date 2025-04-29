"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { InventoryService } from "@/services/inventory-service"
import type {
  Product,
  InventoryTransaction,
  CreateProductDTO,
  UpdateProductDTO,
  AdjustmentData,
  SortConfig,
  InventoryStats,
} from "@/types/inventory"

// Tipos de transacciones
export const transactionTypes = ["Recepción", "Venta", "Ajuste", "Devolución", "Transferencia"]

export function useInventory() {
  // Estados para la gestión de la interfaz
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [categories, setCategories] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "name", direction: "ascending" })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [products, setProducts] = useState<Product[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [newProduct, setNewProduct] = useState<CreateProductDTO>({
    name: "",
    sku: null,
    barcode: null,
    categoryId: null,
    description: null,
    stock: 0,
    reorderLevel: null,
    price: 0,
    costPrice: null,
    supplierId: null,
    expiryDate: null,
    location: null,
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
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [totalTransactionPages, setTotalTransactionPages] = useState(1)
  const [stats, setStats] = useState<InventoryStats | null>(null)

  // Hook para mostrar notificaciones
  const { toast } = useToast()

  // Cargar categorías
  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await InventoryService.getCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      })
    }
  }, [toast])

  // Cargar estadísticas
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await InventoryService.getInventoryStats()
      setStats(statsData)
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive",
      })
    }
  }, [toast])

  // Cargar productos
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      // Determinar el ID de categoría si no es "Todos"
      const categoryId = selectedCategory !== "Todos" ? categories.indexOf(selectedCategory) : null

      // Convertir la dirección de ordenamiento
      const direction = sortConfig.direction === "ascending" ? "asc" : "desc"

      const response = await InventoryService.getProducts(
        searchTerm,
        categoryId,
        currentPage,
        itemsPerPage,
        sortConfig.key,
        direction,
      )

      setProducts(response.products)
      setTotalItems(response.pagination.total)
      setTotalPages(response.pagination.pages)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, selectedCategory, categories, currentPage, itemsPerPage, sortConfig, toast])

  // Cargar transacciones
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await InventoryService.getTransactions(currentTransactionPage, transactionsPerPage)

      setTransactions(response.transactions)
      setTotalTransactions(response.pagination.total)
      setTotalTransactionPages(response.pagination.pages)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las transacciones",
        variant: "destructive",
      })
    }
  }, [currentTransactionPage, transactionsPerPage, toast])

  // Cargar datos iniciales
  useEffect(() => {
    fetchCategories()
    fetchStats()
  }, [fetchCategories, fetchStats])

  // Cargar productos cuando cambian los filtros
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Cargar transacciones cuando cambia la paginación
  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Función para cambiar el orden
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Funciones para gestionar productos
  const handleAddProduct = async () => {
    setIsSubmitting(true)

    try {
      await InventoryService.createProduct(newProduct)

      setIsAddDialogOpen(false)

      // Resetear el formulario
      setNewProduct({
        name: "",
        sku: null,
        barcode: null,
        categoryId: null,
        description: null,
        stock: 0,
        reorderLevel: null,
        price: 0,
        costPrice: null,
        supplierId: null,
        expiryDate: null,
        location: null,
      })

      // Recargar productos
      fetchProducts()
      fetchStats()

      toast({
        title: "Producto agregado",
        description: "El producto ha sido agregado correctamente.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar el producto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProduct = async () => {
    if (!productToEdit) return

    setIsSubmitting(true)

    try {
      const updateData: UpdateProductDTO = {
        name: productToEdit.name,
        sku: productToEdit.sku,
        barcode: productToEdit.barcode,
        categoryId: productToEdit.categoryId,
        description: productToEdit.description,
        reorderLevel: productToEdit.reorderLevel,
        price: productToEdit.price,
        costPrice: productToEdit.costPrice,
        supplierId: productToEdit.supplierId,
        expiryDate: productToEdit.expiryDate,
        location: productToEdit.location,
      }

      await InventoryService.updateProduct(productToEdit.id, updateData)

      setIsEditDialogOpen(false)

      // Recargar productos
      fetchProducts()

      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado correctamente.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    setIsSubmitting(true)

    try {
      await InventoryService.deleteProduct(productToDelete.id)

      setIsDeleteDialogOpen(false)
      setProductToDelete(null)

      // Recargar productos
      fetchProducts()
      fetchStats()

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAdjustStock = async () => {
    if (!productToAdjust) return

    setIsSubmitting(true)

    try {
      await InventoryService.adjustStock(productToAdjust.id, adjustmentData)

      setIsAdjustDialogOpen(false)

      // Resetear el formulario
      setAdjustmentData({
        quantity: 0,
        type: "Ajuste",
        notes: "",
      })

      // Recargar productos y transacciones
      fetchProducts()
      fetchTransactions()
      fetchStats()

      toast({
        title: "Stock ajustado",
        description: "El stock del producto ha sido ajustado correctamente.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error adjusting stock:", error)
      toast({
        title: "Error",
        description: "No se pudo ajustar el stock del producto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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

  // Función para obtener el historial de un producto
  const getProductHistory = async (product: Product) => {
    try {
      const response = await InventoryService.getTransactions(1, 100, product.id)
      return response.transactions
    } catch (error) {
      console.error("Error fetching product history:", error)
      toast({
        title: "Error",
        description: "No se pudo obtener el historial del producto",
        variant: "destructive",
      })
      return []
    }
  }

  return {
    // Estado
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
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
    products,
    totalItems,
    totalPages,
    indexOfFirstItem: (currentPage - 1) * itemsPerPage,
    indexOfLastItem: Math.min(currentPage * itemsPerPage, totalItems),
    transactions,
    totalTransactions,
    totalTransactionPages,
    indexOfFirstTransaction: (currentTransactionPage - 1) * transactionsPerPage,
    indexOfLastTransaction: Math.min(currentTransactionPage * transactionsPerPage, totalTransactions),
    stats,

    // Funciones
    requestSort,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleAdjustStock,
    handleExportInventory,
    getProductHistory,
  }
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { InventoryService } from "@/services/inventory-service"
import { PreferencesService } from "@/services/preferences-service"
import type {
  Product,
  InventoryTransaction,
  CreateProductDTO,
  UpdateProductDTO,
  AdjustmentData,
  SortConfig,
  InventoryStats,
  Category,
} from "@/types/inventory"

// First, add the import for the export functions at the top of the file
import { exportInventoryToPDF, exportInventoryToCSV } from "@/lib/export-utils"
import { exportInventoryToJSON } from "@/lib/export-utils"

// Tipos de transacciones
export const transactionTypes = ["Recepción", "Venta", "Ajuste", "Devolución", "Transferencia"]

export function useInventory() {
  // Get saved preferences
  const savedPreferences = PreferencesService.getInventoryPreferences()

  // Estados para la gestión de la interfaz
  const [searchTerm, setSearchTerm] = useState("")
  const [_selectedCategory, setSelectedCategory] = useState<string | null>("Todos")
  const [categories, setCategories] = useState<Category[]>([])
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
  const [itemsPerPage, setItemsPerPage] = useState(savedPreferences.productsPerPage)
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
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [selectedProductHistory, setSelectedProductHistory] = useState<Product | null>(null)
  const [productHistoryTransactions, setProductHistoryTransactions] = useState<InventoryTransaction[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1)
  const [transactionsPerPage, setTransactionsPerPage] = useState(savedPreferences.transactionsPerPage)
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
  // Actualizar la función fetchProducts para usar el ID de categoría correctamente
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      // Determinar el ID de categoría si no es "Todos"
      const categoryId =
        _selectedCategory !== "Todos" ? categories.find((cat) => cat.name === _selectedCategory)?.id : null

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
  }, [searchTerm, _selectedCategory, categories, currentPage, itemsPerPage, sortConfig, toast])

  // New function to fetch all products (not paginated)
  const fetchAllProducts = useCallback(async () => {
    try {
      // Use a large page size to get all products in one request
      const response = await InventoryService.getProducts("", null, 1, 1000, "name", "asc")
      return response.products
    } catch (error) {
      console.error("Error fetching all products:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar todos los productos para exportar",
        variant: "destructive",
      })
      return []
    }
  }, [toast])

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

  // Actualizar preferencias cuando cambia el número de elementos por página
  useEffect(() => {
    PreferencesService.setInventoryPreferences({
      productsPerPage: itemsPerPage,
    })
  }, [itemsPerPage])

  // Actualizar preferencias cuando cambia el número de transacciones por página
  useEffect(() => {
    PreferencesService.setInventoryPreferences({
      transactionsPerPage: transactionsPerPage,
    })
  }, [transactionsPerPage])

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

  // Updated function to export inventory - now fetches all products first
  const handleExportInventory = async (format: string) => {
    setIsSubmitting(true)

    try {
      // Fetch all products before exporting
      console.log("Fetching all products for export...")
      const allProducts = await fetchAllProducts()
      console.log(`Got ${allProducts.length} products for export`)

      // Exportar según el formato seleccionado
      switch (format) {
        case "pdf":
          exportInventoryToPDF(allProducts)
          break
        case "csv":
          exportInventoryToCSV(allProducts)
          break
        case "json":
          exportInventoryToJSON(allProducts)
          break
        default:
          throw new Error(`Formato no soportado: ${format}`)
      }

      toast({
        title: "Inventario exportado",
        description: `El inventario ha sido exportado en formato ${format.toUpperCase()}.`,
        variant: "success",
      })
    } catch (error) {
      console.error(`Error exporting inventory to ${format}:`, error)
      toast({
        title: "Error",
        description: `No se pudo exportar el inventario en formato ${format.toUpperCase()}.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para obtener el historial de un producto
  const fetchProductHistory = async (product: Product) => {
    if (!product) return

    setIsLoadingHistory(true)
    setProductHistoryTransactions([])

    try {
      console.log("Fetching history for product:", product.id, product.name)
      const response = await InventoryService.getTransactions(1, 100, product.id)
      console.log("Transaction response:", response)

      setProductHistoryTransactions(response.transactions)
      return response.transactions
    } catch (error) {
      console.error("Error fetching product history:", error)
      toast({
        title: "Error",
        description: "No se pudo obtener el historial del producto",
        variant: "destructive",
      })
      setProductHistoryTransactions([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Función para ver el historial de un producto
  const handleViewProductHistory = async (product: Product) => {
    setSelectedProductHistory(product)
    await fetchProductHistory(product)
    setIsHistoryDialogOpen(true)
  }

  return {
    // Estado
    searchTerm,
    setSearchTerm,
    selectedCategory: _selectedCategory,
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
    isHistoryDialogOpen,
    setIsHistoryDialogOpen,
    selectedProductHistory,
    setSelectedProductHistory,
    productHistoryTransactions,
    isLoadingHistory,
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
    fetchProductHistory,
    handleViewProductHistory,
  }
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"
import { SupplierService } from "@/services/supplier-service"
import { PurchaseService } from "@/services/purchase-service"
import { PreferencesService } from "@/services/preferences-service"
import {
  exportSuppliersToCSV,
  exportSuppliersToJSON,
  downloadBlob,
  generateFilename,
} from "@/lib/supplier-export-utils"
import { exportOrdersToCSV, exportOrdersToJSON } from "@/lib/order-export-utils"
import { generateSuppliersPDF } from "@/lib/supplier-pdf-generator"
import { generateOrdersPDF } from "@/lib/order-pdf-generator"
import type {
  Supplier,
  SupplierForm,
  SupplierStats,
  SupplierProduct,
  SupplierOrder,
  SortConfig,
} from "@/types/suppliers"
import type { CreatePurchaseDTO } from "@/types/purchases"

// Función para formatear fechas
export const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A"
  return format(new Date(dateString), "dd/MM/yyyy")
}

// Formulario inicial vacío
const initialSupplierForm: SupplierForm = {
  name: "",
  contact: "",
  email: "",
  phone: "",
  address: "",
  category: "",
  status: "active",
}

export function useSuppliers() {
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Todos")
  const [categories, setCategories] = useState<string[]>(["Todos"])
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Modificar los estados de paginación y ordenación para usar las preferencias guardadas
  const preferences = PreferencesService.getSuppliersPreferences()
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: preferences.defaultSuppliersSortKey,
    direction: preferences.defaultSuppliersSortDirection,
  })
  const [itemsPerPage, setItemsPerPage] = useState(preferences.suppliersPerPage)
  const [orderSortConfig, setOrderSortConfig] = useState<SortConfig>({
    key: preferences.defaultOrdersSortKey,
    direction: preferences.defaultOrdersSortDirection,
  })
  const [ordersItemsPerPage, setOrdersItemsPerPage] = useState(preferences.ordersPerPage)

  // Estados para paginación de proveedores
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Estados para paginación de pedidos
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1)
  const [ordersTotalItems, setOrdersTotalItems] = useState(0)
  const [ordersTotalPages, setOrdersTotalPages] = useState(1)

  // Estado para los datos
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([])
  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>([])
  const [orders, setOrders] = useState<SupplierOrder[]>([])
  const [stats, setStats] = useState<SupplierStats>({
    total: 0,
    active: 0,
    products: 0,
    lastOrderDate: null,
  })

  // Estado para el formulario de nuevo proveedor
  const [supplierForm, setSupplierForm] = useState<SupplierForm>({ ...initialSupplierForm })

  // Estado para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)

  // Estado para indicar si está procesando una operación
  const [isProcessing, setIsProcessing] = useState(false)

  // Estado para indicar si está exportando datos
  const [isExporting, setIsExporting] = useState(false)

  // Estados para pedidos
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null)
  const [isOrderDetailsDialogOpen, setIsOrderDetailsDialogOpen] = useState(false)
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false)
  const [supplierForNewOrder, setSupplierForNewOrder] = useState<Supplier | null>(null)

  // Añadir un nuevo estado para controlar la actualización de datos
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Add this new state
  const [isStatusUpdateProcessing, setIsStatusUpdateProcessing] = useState(false)

  // Cargar categorías al inicio
  useEffect(() => {
    loadCategories()
  }, [])

  // Cargar proveedores cuando cambian los filtros o la paginación
  useEffect(() => {
    loadSuppliers()
  }, [searchTerm, categoryFilter, currentPage, itemsPerPage, refreshTrigger])

  // Cargar estadísticas al inicio
  useEffect(() => {
    loadStats()
  }, [refreshTrigger])

  // Cargar pedidos
  useEffect(() => {
    loadOrders()
  }, [ordersCurrentPage, ordersItemsPerPage, refreshTrigger])

  // Resetear el formulario cuando se cierra el diálogo de añadir
  useEffect(() => {
    if (!isAddDialogOpen) {
      setSupplierForm({ ...initialSupplierForm })
    }
  }, [isAddDialogOpen])

  // Resetear el formulario cuando se cierra el diálogo de editar
  useEffect(() => {
    if (!isEditDialogOpen) {
      setSupplierForm({ ...initialSupplierForm })
    }
  }, [isEditDialogOpen])

  // Función para cargar categorías
  const loadCategories = async () => {
    try {
      const categoriesData = await SupplierService.getSupplierCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error loading categories:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías de proveedores",
        variant: "destructive",
      })
    }
  }

  // Función para cargar proveedores
  const loadSuppliers = async () => {
    try {
      setIsProcessing(true)
      const response = await SupplierService.getSuppliers(searchTerm, categoryFilter, currentPage, itemsPerPage)
      setSuppliers(response.suppliers)
      setTotalItems(response.pagination.total)
      setTotalPages(response.pagination.pages)
      setIsProcessing(false)
    } catch (error) {
      console.error("Error loading suppliers:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los proveedores",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  // Función para cargar estadísticas
  const loadStats = async () => {
    try {
      const statsData = await SupplierService.getSupplierStats()
      setStats(statsData)
    } catch (error) {
      console.error("Error loading stats:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas de proveedores",
        variant: "destructive",
      })
    }
  }

  // Función para cargar pedidos
  const loadOrders = async () => {
    try {
      setIsProcessing(true)

      // Obtener pedidos reales de la API
      const response = await PurchaseService.getPurchases(ordersCurrentPage, ordersItemsPerPage)

      // Mapear la respuesta al formato que espera nuestro componente
      const mappedOrders: SupplierOrder[] = response.purchases.map((purchase) => ({
        id: purchase.id,
        date: purchase.purchaseDate,
        expectedDate: purchase.expectedDeliveryDate,
        items: purchase.items.length,
        total: purchase.total,
        status:
          purchase.status === "pending"
            ? "Pendiente"
            : purchase.status === "received"
              ? "Recibido"
              : purchase.status === "cancelled"
                ? "Cancelado"
                : purchase.status,
        supplierName: purchase.supplierName,
        supplierId: purchase.supplierId,
        orderItems: purchase.items.map((item) => ({
          productId: item.productId.toString(),
          productName: item.productName,
          quantity: item.quantity,
          price: item.unitPrice,
        })),
        notes: purchase.notes,
      }))

      setOrders(mappedOrders)
      setOrdersTotalItems(response.pagination.total)
      setOrdersTotalPages(response.pagination.pages)
      setIsProcessing(false)
    } catch (error) {
      console.error("Error loading orders:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  // Modificar la función changeItemsPerPage para guardar las preferencias
  const changeItemsPerPage = (value: string) => {
    const newValue = Number(value)
    setItemsPerPage(newValue)
    setCurrentPage(1) // Resetear a la primera página cuando cambia el número de items

    // Guardar la preferencia
    PreferencesService.setSuppliersPreferences({
      suppliersPerPage: newValue,
    })
  }

  // Modificar la función changeOrdersItemsPerPage para guardar las preferencias
  const changeOrdersItemsPerPage = (value: string) => {
    const newValue = Number(value)
    setOrdersItemsPerPage(newValue)
    setOrdersCurrentPage(1) // Resetear a la primera página cuando cambia el número de items

    // Guardar la preferencia
    PreferencesService.setSuppliersPreferences({
      ordersPerPage: newValue,
    })
  }

  // Modificar la función requestSort para guardar las preferencias
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })

    // Guardar las preferencias
    PreferencesService.setSuppliersPreferences({
      defaultSuppliersSortKey: key,
      defaultSuppliersSortDirection: direction,
    })
  }

  // Modificar la función requestOrderSort para guardar las preferencias
  const requestOrderSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (orderSortConfig.key === key && orderSortConfig.direction === "ascending") {
      direction = "descending"
    }
    setOrderSortConfig({ key, direction })

    // Guardar las preferencias
    PreferencesService.setSuppliersPreferences({
      defaultOrdersSortKey: key,
      defaultOrdersSortDirection: direction,
    })
  }

  // Función para manejar la visualización de detalles
  const handleViewDetails = async (supplier: Supplier) => {
    try {
      setIsProcessing(true)
      const detailResponse = await SupplierService.getSupplierById(supplier.id)
      setSelectedSupplier(detailResponse.supplier)
      setSupplierProducts(detailResponse.products)
      setSupplierOrders(detailResponse.orders)
      setIsProcessing(false)
    } catch (error) {
      console.error("Error loading supplier details:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del proveedor",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  // Función para manejar la visualización de detalles de pedido
  const handleViewOrderDetails = async (order: SupplierOrder) => {
    try {
      // Si el ID del pedido es num��rico (sin el prefijo), obtener los detalles completos
      const orderId = order.id.replace(/^PUR-0*/, "") // Eliminar prefijo y ceros iniciales
      const numericId = Number.parseInt(orderId, 10)

      if (!isNaN(numericId)) {
        setIsProcessing(true)
        const purchaseDetails = await PurchaseService.getPurchaseById(numericId)

        // Mapear la respuesta al formato que espera nuestro componente
        const mappedOrder: SupplierOrder = {
          id: purchaseDetails.id,
          date: purchaseDetails.purchaseDate,
          expectedDate: purchaseDetails.expectedDeliveryDate,
          items: purchaseDetails.items.length,
          total: purchaseDetails.total,
          status:
            purchaseDetails.status === "pending"
              ? "Pendiente"
              : purchaseDetails.status === "received"
                ? "Recibido"
                : purchaseDetails.status === "cancelled"
                  ? "Cancelado"
                  : purchaseDetails.status,
          supplierName: purchaseDetails.supplierName,
          supplierId: purchaseDetails.supplierId,
          orderItems: purchaseDetails.items.map((item) => ({
            productId: item.productId.toString(),
            productName: item.productName,
            quantity: item.quantity,
            price: item.unitPrice,
          })),
          notes: purchaseDetails.notes,
        }

        setSelectedOrder(mappedOrder)
        setIsProcessing(false)
      } else {
        // Si no es un ID numérico, usar los datos que ya tenemos
        setSelectedOrder(order)
      }
    } catch (error) {
      console.error("Error loading order details:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del pedido",
        variant: "destructive",
      })
      // Usar los datos que ya tenemos en caso de error
      setSelectedOrder(order)
    }

    setIsOrderDetailsDialogOpen(true)
  }

  // Función para iniciar un nuevo pedido
  const handleNewOrder = (supplier: Supplier) => {
    setSupplierForNewOrder(supplier)
    setIsNewOrderDialogOpen(true)
  }

  // Función para crear un nuevo pedido
  const handleCreateOrder = async (orderData: any) => {
    setIsProcessing(true)

    try {
      // Extraer los datos ya formateados del componente
      const purchaseData: CreatePurchaseDTO = {
        supplierId: Number(orderData.supplierId),
        expectedDeliveryDate: orderData.expectedDeliveryDate,
        items: orderData.items,
        notes: orderData.notes,
      }

      // Llamar a la API para crear el pedido
      const response = await PurchaseService.createPurchase(purchaseData)

      // Mostrar notificación de éxito
      toast({
        title: "Pedido creado",
        description: `El pedido ${response.id} ha sido creado correctamente.`,
      })

      // Actualizar todos los datos
      setRefreshTrigger((prev) => prev + 1)

      // Cerrar el diálogo y resetear estados
      setIsNewOrderDialogOpen(false)
      setSupplierForNewOrder(null)
      setIsProcessing(false)
    } catch (error: any) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el pedido",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  // Add this new function after handleCreateOrder
  // Función para actualizar el estado de un pedido
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsStatusUpdateProcessing(true)

    try {
      // Extraer el ID numérico del pedido
      const numericId = Number.parseInt(orderId.replace(/^PUR-0*/, ""), 10)

      if (isNaN(numericId)) {
        throw new Error("ID de pedido inválido")
      }

      // Llamar a la API para actualizar el estado
      const response = await PurchaseService.updatePurchaseStatus(numericId, newStatus)

      // Mostrar notificación de éxito
      toast({
        title: newStatus === "received" ? "Pedido recibido" : "Pedido cancelado",
        description: `El pedido ${response.id} ha sido ${newStatus === "received" ? "marcado como recibido" : "cancelado"} correctamente.`,
      })

      // Actualizar todos los datos
      setRefreshTrigger((prev) => prev + 1)

      // Cerrar el diálogo de detalles
      setIsOrderDetailsDialogOpen(false)
      setSelectedOrder(null)
    } catch (error: any) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: error.message || `No se pudo ${newStatus === "received" ? "recibir" : "cancelar"} el pedido`,
        variant: "destructive",
      })
    } finally {
      setIsStatusUpdateProcessing(false)
    }
  }

  // Funciones para paginación de proveedores
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Funciones para paginación de pedidos
  const nextOrdersPage = () => {
    if (ordersCurrentPage < ordersTotalPages) {
      setOrdersCurrentPage(ordersCurrentPage + 1)
    }
  }

  const prevOrdersPage = () => {
    if (ordersCurrentPage > 1) {
      setOrdersCurrentPage(ordersCurrentPage - 1)
    }
  }

  // Función para manejar cambios en el formulario de proveedor
  const handleSupplierFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setSupplierForm({
      ...supplierForm,
      [id]: value,
    })
  }

  // Función para manejar cambios en selects
  const handleSelectChange = (field: string, value: string) => {
    setSupplierForm({
      ...supplierForm,
      [field]: value,
    })
  }

  // Función para iniciar la edición de un proveedor
  const handleEditSupplier = (supplier: Supplier) => {
    // Convertir el proveedor seleccionado al formato del formulario
    setSupplierForm({
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      category: supplier.category,
      status: supplier.status,
    })

    // Abrir el diálogo de edición
    setSelectedSupplier(supplier)
    setIsEditDialogOpen(true)
  }

  // Función para guardar los cambios de un proveedor editado
  const handleSaveEditedSupplier = async () => {
    if (!selectedSupplier) return

    setIsProcessing(true)

    try {
      await SupplierService.updateSupplier(selectedSupplier.id, supplierForm)

      // Mostrar notificación de éxito
      toast({
        title: "Proveedor actualizado",
        description: `Los datos de ${supplierForm.name} han sido actualizados correctamente.`,
      })

      // Actualizar todos los datos
      setRefreshTrigger((prev) => prev + 1)

      // Cerrar el diálogo y resetear estados
      setIsEditDialogOpen(false)
      setSelectedSupplier(null)
      setIsProcessing(false)
    } catch (error) {
      console.error("Error updating supplier:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el proveedor",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  // Función para manejar el envío del formulario de nuevo proveedor
  const handleAddSupplier = async () => {
    setIsProcessing(true)

    try {
      await SupplierService.createSupplier(supplierForm)

      // Mostrar notificación de éxito
      toast({
        title: "Proveedor añadido",
        description: `${supplierForm.name} ha sido añadido correctamente.`,
      })

      // Actualizar todos los datos
      setRefreshTrigger((prev) => prev + 1)

      // Resetear el formulario y cerrar el diálogo
      setSupplierForm({ ...initialSupplierForm })
      setIsAddDialogOpen(false)
      setIsProcessing(false)
    } catch (error) {
      console.error("Error adding supplier:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el proveedor",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  // Función para manejar la eliminación de un proveedor
  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return

    setIsProcessing(true)

    try {
      await SupplierService.deleteSupplier(supplierToDelete.id)

      // Mostrar notificación de éxito
      toast({
        title: "Proveedor eliminado",
        description: `${supplierToDelete.name} ha sido eliminado correctamente.`,
      })

      // Actualizar todos los datos
      setRefreshTrigger((prev) => prev + 1)

      // Cerrar el diálogo de confirmación
      setIsDeleteDialogOpen(false)
      setSupplierToDelete(null)
      setIsProcessing(false)
    } catch (error) {
      console.error("Error deleting supplier:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el proveedor",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  // Función para abrir el diálogo de confirmación de eliminación
  const confirmDelete = (supplier: Supplier) => {
    setSupplierToDelete(supplier)
    setIsDeleteDialogOpen(true)
  }

  // Función para exportar datos de proveedores y pedidos en diferentes formatos
  const exportData = async (format: "csv" | "json" | "pdf", type: "suppliers" | "orders") => {
    setIsExporting(true)

    try {
      let blob: Blob
      let filename: string

      // Exportar según el tipo (proveedores o pedidos)
      if (type === "suppliers") {
        // Obtener todos los proveedores para la exportación
        let allSuppliers = suppliers

        // Si hay filtros aplicados o paginación, podríamos querer exportar todos los proveedores
        if (searchTerm || categoryFilter !== "Todos" || totalItems > suppliers.length) {
          try {
            // Obtener todos los proveedores sin filtros ni paginación
            const response = await SupplierService.getSuppliers("", "Todos", 1, totalItems)
            allSuppliers = response.suppliers
          } catch (error) {
            console.error("Error loading all suppliers for export:", error)
            // Si falla, usamos los proveedores que ya tenemos cargados
          }
        }

        // Exportar proveedores según el formato
        switch (format) {
          case "csv":
            blob = exportSuppliersToCSV(allSuppliers)
            filename = generateFilename("proveedores", "csv")
            break
          case "json":
            blob = exportSuppliersToJSON(allSuppliers)
            filename = generateFilename("proveedores", "json")
            break
          case "pdf":
            blob = await generateSuppliersPDF(allSuppliers)
            filename = generateFilename("proveedores", "pdf")
            break
          default:
            throw new Error(`Formato de exportación no soportado: ${format}`)
        }
      } else {
        // Obtener todos los pedidos para la exportación
        let allOrders = orders

        // Si hay paginación, podríamos querer exportar todos los pedidos
        if (ordersTotalItems > orders.length) {
          try {
            // Obtener todos los pedidos sin paginación
            const response = await PurchaseService.getPurchases(1, ordersTotalItems)

            // Mapear la respuesta al formato que espera nuestro componente
            allOrders = response.purchases.map((purchase) => ({
              id: purchase.id,
              date: purchase.purchaseDate,
              expectedDate: purchase.expectedDeliveryDate,
              items: purchase.items.length,
              total: purchase.total,
              status:
                purchase.status === "pending"
                  ? "Pendiente"
                  : purchase.status === "received"
                    ? "Recibido"
                    : purchase.status === "cancelled"
                      ? "Cancelado"
                      : purchase.status,
              supplierName: purchase.supplierName,
              supplierId: purchase.supplierId,
              orderItems: purchase.items.map((item) => ({
                productId: item.productId.toString(),
                productName: item.productName,
                quantity: item.quantity,
                price: item.unitPrice,
              })),
              notes: purchase.notes,
            }))
          } catch (error) {
            console.error("Error loading all orders for export:", error)
            // Si falla, usamos los pedidos que ya tenemos cargados
          }
        }

        // Exportar pedidos según el formato
        switch (format) {
          case "csv":
            blob = exportOrdersToCSV(allOrders)
            filename = generateFilename("pedidos", "csv")
            break
          case "json":
            blob = exportOrdersToJSON(allOrders)
            filename = generateFilename("pedidos", "json")
            break
          case "pdf":
            blob = await generateOrdersPDF(allOrders)
            filename = generateFilename("pedidos", "pdf")
            break
          default:
            throw new Error(`Formato de exportación no soportado: ${format}`)
        }
      }

      // Descargar el archivo
      downloadBlob(blob, filename)

      // Mostrar notificación de éxito
      toast({
        title: "Exportación completada",
        description: `Los datos de ${type === "suppliers" ? "proveedores" : "pedidos"} han sido exportados en formato ${format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error(`Error exporting ${type} to ${format}:`, error)
      toast({
        title: "Error de exportación",
        description: `No se pudieron exportar los datos de ${
          type === "suppliers" ? "proveedores" : "pedidos"
        } en formato ${format.toUpperCase()}.`,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Calcular índices para paginación de proveedores
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage

  // Calcular índices para paginación de pedidos
  const ordersIndexOfLastItem = ordersCurrentPage * ordersItemsPerPage
  const ordersIndexOfFirstItem = ordersIndexOfLastItem - ordersItemsPerPage

  return {
    // Datos
    stats,
    suppliers,
    selectedSupplier,
    supplierToDelete,
    supplierProducts,
    supplierOrders,
    orders,
    selectedOrder,
    supplierForNewOrder,
    categories,

    // Estados
    searchTerm,
    categoryFilter,
    sortConfig,
    orderSortConfig,
    currentPage,
    itemsPerPage,
    ordersCurrentPage,
    ordersItemsPerPage,
    supplierForm,
    isAddDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isOrderDetailsDialogOpen,
    isNewOrderDialogOpen,
    isProcessing,
    isExporting,
    // Add isStatusUpdateProcessing to the return object
    isStatusUpdateProcessing,

    // Cálculos para paginación
    totalPages,
    totalItems,
    indexOfFirstItem,
    indexOfLastItem,
    ordersTotalPages,
    ordersTotalItems,
    ordersIndexOfFirstItem,
    ordersIndexOfLastItem,

    // Funciones
    setSearchTerm,
    setCategoryFilter,
    requestSort,
    requestOrderSort,
    handleViewDetails,
    handleViewOrderDetails,
    handleNewOrder,
    handleCreateOrder,
    // Add handleUpdateOrderStatus to the return object
    handleUpdateOrderStatus,
    nextPage,
    prevPage,
    changeItemsPerPage,
    nextOrdersPage,
    prevOrdersPage,
    changeOrdersItemsPerPage,
    handleSupplierFormChange,
    handleSelectChange,
    handleEditSupplier,
    handleSaveEditedSupplier,
    handleAddSupplier,
    handleDeleteSupplier,
    confirmDelete,
    exportData, // Nueva función unificada para exportar
    setIsAddDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsOrderDetailsDialogOpen,
    setIsNewOrderDialogOpen,
    setSelectedSupplier,
    setSelectedOrder,
    refreshTrigger,
    setRefreshTrigger,
  }
}

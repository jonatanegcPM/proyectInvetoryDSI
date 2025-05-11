"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"
import { SupplierService } from "@/services/supplier-service"
import { PurchaseService } from "@/services/purchase-service"
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
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "name", direction: "ascending" })

  // Estados para paginación de proveedores
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Estados para paginación de pedidos
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1)
  const [ordersItemsPerPage, setOrdersItemsPerPage] = useState(5)
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
  const [orderSortConfig, setOrderSortConfig] = useState<SortConfig>({ key: "date", direction: "descending" })
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null)
  const [isOrderDetailsDialogOpen, setIsOrderDetailsDialogOpen] = useState(false)
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false)
  const [supplierForNewOrder, setSupplierForNewOrder] = useState<Supplier | null>(null)

  // Cargar categorías al inicio
  useEffect(() => {
    loadCategories()
  }, [])

  // Cargar proveedores cuando cambian los filtros o la paginación
  useEffect(() => {
    loadSuppliers()
  }, [searchTerm, categoryFilter, currentPage, itemsPerPage])

  // Cargar estadísticas al inicio
  useEffect(() => {
    loadStats()
  }, [])

  // Cargar pedidos
  useEffect(() => {
    loadOrders()
  }, [ordersCurrentPage, ordersItemsPerPage])

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

  // Función para cambiar el orden
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Función para cambiar el orden de pedidos
  const requestOrderSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (orderSortConfig.key === key && orderSortConfig.direction === "ascending") {
      direction = "descending"
    }
    setOrderSortConfig({ key, direction })
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
      // Si el ID del pedido es numérico (sin el prefijo), obtener los detalles completos
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

      // Recargar los pedidos
      loadOrders()

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

  const changeItemsPerPage = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1) // Resetear a la primera página cuando cambia el número de items
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

  const changeOrdersItemsPerPage = (value: string) => {
    setOrdersItemsPerPage(Number(value))
    setOrdersCurrentPage(1) // Resetear a la primera página cuando cambia el número de items
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

      // Recargar los proveedores
      loadSuppliers()

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

      // Recargar los proveedores
      loadSuppliers()

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

      // Recargar los proveedores
      loadSuppliers()

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

  // Función para exportar datos de proveedores en diferentes formatos
  const exportSuppliersData = (format: "csv" | "excel" | "pdf") => {
    setIsExporting(true)

    // Simular procesamiento de exportación
    setTimeout(() => {
      // En una implementación real, esto sería una llamada a la API
      // o procesamiento en el cliente para generar el archivo correspondiente

      // Preparar los datos para exportación
      const headers = ["ID", "Nombre", "Contacto", "Email", "Teléfono", "Categoría", "Estado"]

      // Simular diferentes comportamientos según el formato
      if (format === "csv") {
        // Convertir los datos a formato CSV
        const csvContent = [
          headers.join(","),
          ...suppliers.map((supplier) =>
            [
              supplier.id,
              supplier.name,
              supplier.contact,
              supplier.email,
              supplier.phone,
              supplier.category,
              supplier.status === "active" ? "Activo" : supplier.status === "inactive" ? "Inactivo" : "Pendiente",
            ].join(","),
          ),
        ].join("\n")

        // Crear un blob y un enlace de descarga
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `proveedores_${new Date().toISOString().slice(0, 10)}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // Para Excel y PDF, en una implementación real se usarían bibliotecas específicas
        // Aquí solo simulamos la acción
        console.log(`Exportando en formato ${format}...`)
      }

      // Mostrar notificación de éxito
      toast({
        title: "Exportación completada",
        description: `Los datos de proveedores han sido exportados en formato ${format.toUpperCase()}.`,
      })

      setIsExporting(false)
    }, 1500)
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
    exportSuppliersData,
    setIsAddDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsOrderDetailsDialogOpen,
    setIsNewOrderDialogOpen,
    setSelectedSupplier,
    setSelectedOrder,
  }
}

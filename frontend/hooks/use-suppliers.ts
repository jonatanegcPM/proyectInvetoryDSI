"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"
import type {
  Supplier,
  SupplierForm,
  SupplierStats,
  SupplierProduct,
  SupplierOrder,
  SortConfig,
} from "@/types/suppliers"

// Datos de ejemplo para proveedores
const suppliersData: Supplier[] = [
  {
    id: 1,
    name: "Distribuidora MediFarma",
    contact: "Juan Martínez",
    email: "juan@medifarma.com",
    phone: "123-456-7890",
    address: "Calle Farmacia 123, Distrito Médico, Madrid 28001",
    status: "active",
    products: 42,
    lastOrder: "2023-05-15",
    category: "Medicamentos",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Suministros Médicos S.A.",
    contact: "Sara Jiménez",
    email: "sara@suministrosmedicos.com",
    phone: "234-567-8901",
    address: "Avenida Salud 456, Centro Médico, Barcelona 08001",
    status: "active",
    products: 28,
    lastOrder: "2023-05-10",
    category: "Equipos Médicos",
    rating: 4.5,
  },
  {
    id: 3,
    name: "Soluciones Farmacéuticas Globales",
    contact: "Miguel Moreno",
    email: "miguel@globalpharma.com",
    phone: "345-678-9012",
    address: "Bulevar Farmacéutico 789, Parque Farmacéutico, Valencia 46001",
    status: "inactive",
    products: 35,
    lastOrder: "2023-04-22",
    category: "Medicamentos",
    rating: 4.2,
  },
  {
    id: 4,
    name: "Equipos MediTech S.L.",
    contact: "Elena Díaz",
    email: "elena@meditech.com",
    phone: "456-789-0123",
    address: "Calle Tecnología 101, Ciudad Médica, Sevilla 41001",
    status: "active",
    products: 15,
    lastOrder: "2023-05-18",
    category: "Equipos Médicos",
    rating: 4.7,
  },
  {
    id: 5,
    name: "Productos Bienestar Ltd.",
    contact: "David Vega",
    email: "david@bienestar.com",
    phone: "567-890-1234",
    address: "Camino Bienestar 202, Puerto Salud, Bilbao 48001",
    status: "pending",
    products: 22,
    lastOrder: "2023-05-05",
    category: "Suplementos",
    rating: 4.0,
  },
]

// Datos de ejemplo para productos por proveedor
const supplierProductsData: SupplierProduct[] = [
  { id: 1, name: "Amoxicillin 500mg", category: "Antibiotics", stock: 120, price: 15.99 },
  { id: 2, name: "Lisinopril 10mg", category: "Blood Pressure", stock: 85, price: 12.5 },
  { id: 3, name: "Metformin 500mg", category: "Diabetes", stock: 95, price: 8.75 },
  { id: 4, name: "Ibuprofen 200mg", category: "Pain Relief", stock: 150, price: 5.99 },
  { id: 5, name: "Omeprazole 20mg", category: "Heartburn", stock: 75, price: 18.25 },
]

// Datos de ejemplo para órdenes por proveedor
const supplierOrdersData: SupplierOrder[] = [
  {
    id: "ORD-2023-001",
    date: "2023-05-15",
    items: 12,
    total: 1250.75,
    status: "Recibido",
    supplierName: "Distribuidora MediFarma",
    supplierId: 1,
    orderItems: [
      { productName: "Amoxicillin 500mg", quantity: 5, price: 15.99 },
      { productName: "Lisinopril 10mg", quantity: 7, price: 12.5 },
    ],
  },
  {
    id: "ORD-2023-002",
    date: "2023-04-28",
    items: 8,
    total: 875.5,
    status: "Recibido",
    supplierName: "Suministros Médicos S.A.",
    supplierId: 2,
    orderItems: [{ productName: "Metformin 500mg", quantity: 8, price: 8.75 }],
  },
  {
    id: "ORD-2023-003",
    date: "2023-04-10",
    items: 15,
    total: 1580.25,
    status: "Recibido",
    supplierName: "Soluciones Farmacéuticas Globales",
    supplierId: 3,
    orderItems: [
      { productName: "Ibuprofen 200mg", quantity: 10, price: 5.99 },
      { productName: "Omeprazole 20mg", quantity: 5, price: 18.25 },
    ],
  },
  {
    id: "ORD-2023-004",
    date: "2023-03-22",
    items: 10,
    total: 950.0,
    status: "Recibido",
    supplierName: "Equipos MediTech S.L.",
    supplierId: 4,
    orderItems: [
      { productName: "Metformin 500mg", quantity: 5, price: 8.75 },
      { productName: "Ibuprofen 200mg", quantity: 5, price: 5.99 },
    ],
  },
  {
    id: "ORD-2023-005",
    date: "2023-05-20",
    items: 5,
    total: 450.75,
    status: "Pendiente",
    supplierName: "Productos Bienestar Ltd.",
    supplierId: 5,
    orderItems: [{ productName: "Lisinopril 10mg", quantity: 5, price: 12.5 }],
  },
  {
    id: "ORD-2023-006",
    date: "2023-06-05",
    items: 7,
    total: 720.3,
    status: "Pendiente",
    supplierName: "Distribuidora MediFarma",
    supplierId: 1,
    orderItems: [
      { productName: "Amoxicillin 500mg", quantity: 3, price: 15.99 },
      { productName: "Omeprazole 20mg", quantity: 4, price: 18.25 },
    ],
  },
  {
    id: "ORD-2023-007",
    date: "2023-06-10",
    items: 9,
    total: 890.45,
    status: "Pendiente",
    supplierName: "Suministros Médicos S.A.",
    supplierId: 2,
    orderItems: [
      { productName: "Lisinopril 10mg", quantity: 4, price: 12.5 },
      { productName: "Ibuprofen 200mg", quantity: 5, price: 5.99 },
    ],
  },
  {
    id: "ORD-2023-008",
    date: "2023-06-15",
    items: 11,
    total: 1100.25,
    status: "Pendiente",
    supplierName: "Soluciones Farmacéuticas Globales",
    supplierId: 3,
    orderItems: [
      { productName: "Metformin 500mg", quantity: 6, price: 8.75 },
      { productName: "Omeprazole 20mg", quantity: 5, price: 18.25 },
    ],
  },
]

// Categorías de proveedores
export const categories = [
  "Todos",
  "Medicamentos",
  "Equipos Médicos",
  "Suplementos",
  "Material Quirúrgico",
  "Productos de Higiene",
]

// Función para formatear fechas
export const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy")
}

export function useSuppliers() {
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Todos")
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "name", direction: "ascending" })

  // Estados para paginación de proveedores
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Estados para paginación de pedidos
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1)
  const [ordersItemsPerPage, setOrdersItemsPerPage] = useState(5)

  // Estado para el formulario de nuevo proveedor
  const [supplierForm, setSupplierForm] = useState<SupplierForm>({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    status: "active",
  })

  // Estado para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)

  // Estado para indicar si está procesando una operación
  const [isProcessing, setIsProcessing] = useState(false)

  // Estado para indicar si está exportando datos
  const [isExporting, setIsExporting] = useState(false)

  // Estados para pedidos
  const [orders, setOrders] = useState<SupplierOrder[]>(supplierOrdersData)
  const [orderSortConfig, setOrderSortConfig] = useState<SortConfig>({ key: "date", direction: "descending" })
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null)
  const [isOrderDetailsDialogOpen, setIsOrderDetailsDialogOpen] = useState(false)
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false)
  const [supplierForNewOrder, setSupplierForNewOrder] = useState<Supplier | null>(null)

  // Filtrar proveedores por búsqueda y filtros
  const filteredSuppliers = suppliersData.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "Todos" || supplier.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Ordenar proveedores
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    if (!sortConfig.key) return 0

    let aValue = a[sortConfig.key as keyof Supplier]
    let bValue = b[sortConfig.key as keyof Supplier]

    // Convertir fechas a objetos Date para comparación
    if (sortConfig.key === "lastOrder") {
      aValue = new Date(aValue as string)
      bValue = new Date(bValue as string)
    }

    if (aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1
    }
    return 0
  })

  // Ordenar pedidos
  const sortedOrders = [...orders].sort((a, b) => {
    if (!orderSortConfig.key) return 0

    let aValue = a[orderSortConfig.key as keyof SupplierOrder]
    let bValue = b[orderSortConfig.key as keyof SupplierOrder]

    // Convertir fechas a objetos Date para comparación
    if (orderSortConfig.key === "date" || orderSortConfig.key === "expectedDate") {
      aValue = new Date(aValue as string)
      bValue = new Date(bValue as string)
    }

    if (aValue < bValue) {
      return orderSortConfig.direction === "ascending" ? -1 : 1
    }
    if (aValue > bValue) {
      return orderSortConfig.direction === "ascending" ? 1 : -1
    }
    return 0
  })

  // Calcular índices para paginación de proveedores
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentSuppliers = sortedSuppliers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedSuppliers.length / itemsPerPage)

  // Calcular índices para paginación de pedidos
  const ordersIndexOfLastItem = ordersCurrentPage * ordersItemsPerPage
  const ordersIndexOfFirstItem = ordersIndexOfLastItem - ordersItemsPerPage
  const currentOrders = sortedOrders.slice(ordersIndexOfFirstItem, ordersIndexOfLastItem)
  const ordersTotalPages = Math.ceil(sortedOrders.length / ordersItemsPerPage)

  // Calcular estadísticas
  const stats: SupplierStats = {
    total: suppliersData.length,
    active: suppliersData.filter((s) => s.status === "active").length,
    products: suppliersData.reduce((sum, supplier) => sum + supplier.products, 0),
    lastOrderDate:
      suppliersData.length > 0
        ? new Date(Math.max(...suppliersData.map((s) => new Date(s.lastOrder).getTime()))).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
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
  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
  }

  // Función para manejar la visualización de detalles de pedido
  const handleViewOrderDetails = (order: SupplierOrder) => {
    setSelectedOrder(order)
    setIsOrderDetailsDialogOpen(true)
  }

  // Función para iniciar un nuevo pedido
  const handleNewOrder = (supplier: Supplier) => {
    setSupplierForNewOrder(supplier)
    setIsNewOrderDialogOpen(true)
  }

  // Función para crear un nuevo pedido
  const handleCreateOrder = (orderData: any) => {
    setIsProcessing(true)

    // Simular una llamada a la API
    setTimeout(() => {
      // Generar un ID único para el pedido
      const orderId = `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, "0")}`

      // Crear el nuevo pedido
      const newOrder: SupplierOrder = {
        id: orderId,
        date: new Date().toISOString().split("T")[0],
        expectedDate: orderData.expectedDate?.toISOString().split("T")[0],
        items: orderData.items.length,
        total: orderData.total,
        status: "Pendiente",
        supplierName: orderData.supplierName,
        supplierId: orderData.supplierId,
        orderItems: orderData.items,
      }

      // Añadir el nuevo pedido a la lista
      setOrders([newOrder, ...orders])

      // Mostrar notificación de éxito
      toast({
        title: "Pedido creado",
        description: `El pedido ${orderId} ha sido creado correctamente.`,
      })

      // Cerrar el diálogo y resetear estados
      setIsNewOrderDialogOpen(false)
      setSupplierForNewOrder(null)
      setIsProcessing(false)
    }, 1000)
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
  const handleSaveEditedSupplier = () => {
    if (!selectedSupplier) return

    setIsProcessing(true)

    // Simular una llamada a la API
    setTimeout(() => {
      // Aquí iría la lógica para enviar los datos a la API
      console.log("Proveedor editado:", selectedSupplier.id, supplierForm)

      // Mostrar notificación de éxito
      toast({
        title: "Proveedor actualizado",
        description: `Los datos de ${supplierForm.name} han sido actualizados correctamente.`,
      })

      // Cerrar el diálogo y resetear estados
      setIsEditDialogOpen(false)
      setSelectedSupplier(null)
      setIsProcessing(false)
    }, 1000)
  }

  // Función para manejar el envío del formulario de nuevo proveedor
  const handleAddSupplier = () => {
    setIsProcessing(true)

    // Simular una llamada a la API
    setTimeout(() => {
      // Aquí iría la lógica para enviar los datos a la API
      console.log("Nuevo proveedor:", supplierForm)

      // Mostrar notificación de éxito
      toast({
        title: "Proveedor añadido",
        description: `${supplierForm.name} ha sido añadido correctamente.`,
      })

      // Resetear el formulario y cerrar el diálogo
      setSupplierForm({
        name: "",
        contact: "",
        email: "",
        phone: "",
        address: "",
        category: "",
        status: "active",
      })
      setIsAddDialogOpen(false)
      setIsProcessing(false)
    }, 1000)
  }

  // Función para manejar la eliminación de un proveedor
  const handleDeleteSupplier = () => {
    if (!supplierToDelete) return

    setIsProcessing(true)

    // Simular una llamada a la API
    setTimeout(() => {
      // Aquí iría la lógica para eliminar el proveedor en la API
      console.log("Proveedor eliminado:", supplierToDelete.id)

      // Mostrar notificación de éxito
      toast({
        title: "Proveedor eliminado",
        description: `${supplierToDelete.name} ha sido eliminado correctamente.`,
      })

      // Cerrar el diálogo de confirmación
      setIsDeleteDialogOpen(false)
      setSupplierToDelete(null)
      setIsProcessing(false)
    }, 1000)
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
          ...filteredSuppliers.map((supplier) =>
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
        link.setAttribute("download", `proveedores_${format(new Date(), "yyyy-MM-dd")}.csv`)
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

  // Obtener productos y órdenes para un proveedor específico
  const getSupplierProducts = () => supplierProductsData
  const getSupplierOrders = () => supplierOrdersData

  // Efecto para resetear la página actual cuando cambia el filtro o la búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter])

  return {
    // Datos
    stats,
    suppliers: currentSuppliers,
    filteredSuppliers,
    sortedSuppliers,
    selectedSupplier,
    supplierToDelete,
    supplierProducts: getSupplierProducts(),
    supplierOrders: getSupplierOrders(),
    orders: currentOrders,
    allOrders: sortedOrders,
    selectedOrder,
    supplierForNewOrder,

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
    indexOfFirstItem,
    indexOfLastItem,
    ordersTotalPages,
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

"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"
import type { Customer, CustomerForm, CustomerStats, SortConfig } from "@/types/customers"
import { CustomerService } from "@/services/customer-service"
import { differenceInYears, isAfter, parseISO } from "date-fns"
import { PreferencesService } from "@/services/preferences-service"
import { exportCustomers } from "@/lib/customer-export-utils"

// Añadir esta interfaz para los errores de validación después de las interfaces existentes
interface ValidationErrors {
  name?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  status?: string
}

// Función para formatear fechas
export const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy")
}

// Formulario vacío para inicialización y reset
const emptyCustomerForm: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  status: "active",
  address: "",
  insurance: "",
  allergies: "",
  notes: "",
}

export function useCustomers() {
  // Cargar preferencias guardadas
  const savedPreferences = PreferencesService.getCustomersPreferences()

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: savedPreferences.defaultSortKey,
    direction: savedPreferences.defaultSortDirection === "desc" ? "descending" : "ascending",
  })

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(savedPreferences.customersPerPage)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Estado para los datos
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0,
    withInsurance: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Estado para el formulario de cliente
  const [customerForm, setCustomerForm] = useState<CustomerForm>(emptyCustomerForm)

  // Estado para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

  // Estado para indicar si está procesando una operación
  const [isProcessing, setIsProcessing] = useState(false)

  // Estado para indicar si está exportando datos
  const [isExporting, setIsExporting] = useState(false)

  // Añadir este estado para los errores de validación después de los otros estados
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // Función para restablecer el formulario
  const resetCustomerForm = () => {
    setCustomerForm(emptyCustomerForm)
  }

  // Función para cargar los clientes
  const loadCustomers = useCallback(async () => {
    setIsLoading(true)
    try {
      // Convertir la dirección de ordenación al formato de la API
      const apiDirection = sortConfig.direction === "ascending" ? "asc" : "desc"

      // Obtener los clientes de la API
      const result = await CustomerService.getCustomers(
        searchTerm,
        statusFilter,
        currentPage,
        itemsPerPage,
        sortConfig.key,
        apiDirection,
      )

      setCustomers(result.customers)
      setTotalItems(result.pagination.total)
      setTotalPages(result.pagination.pages)

      // Cargar estadísticas si estamos en la primera página
      if (currentPage === 1 && searchTerm === "" && statusFilter === "all") {
        const statsData = await CustomerService.getCustomerStats()
        setStats(statsData)
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, statusFilter, currentPage, itemsPerPage, sortConfig])

  // Cargar clientes cuando cambian los filtros o la paginación
  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  // Función para cambiar el orden
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    // Guardar preferencias de ordenación
    PreferencesService.setCustomersPreferences({
      defaultSortKey: key,
      defaultSortDirection: direction === "ascending" ? "asc" : "desc",
    })

    setSortConfig({ key, direction })
  }

  // Función para manejar la visualización de detalles
  const handleViewDetails = async (customer: Customer) => {
    try {
      setIsProcessing(true)
      // Cargar los detalles completos del cliente
      const detailedCustomer = await CustomerService.getCustomerById(customer.id)
      setSelectedCustomer(detailedCustomer)
    } catch (error) {
      console.error("Error al cargar detalles del cliente:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del cliente.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Funciones para paginación
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
    const newItemsPerPage = Number(value)

    // Guardar preferencia de items por página
    PreferencesService.setCustomersPreferences({
      customersPerPage: newItemsPerPage,
    })

    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Resetear a la primera página cuando cambia el número de items
  }

  // Función para manejar cambios en el formulario de cliente
  const handleCustomerFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target
    setCustomerForm({
      ...customerForm,
      [id]: value,
    })
  }

  // Función para manejar cambios en selects
  const handleSelectChange = (field: string, value: string) => {
    setCustomerForm({
      ...customerForm,
      [field]: value,
    })
  }

  // Función para iniciar la edición de un cliente
  const handleEditCustomer = async (customer: Customer) => {
    try {
      setIsProcessing(true)
      // Cargar los detalles completos del cliente
      const detailedCustomer = await CustomerService.getCustomerById(customer.id)

      // Convertir el cliente seleccionado al formato del formulario
      setCustomerForm({
        name: detailedCustomer.name,
        email: detailedCustomer.email,
        phone: detailedCustomer.phone,
        dateOfBirth: detailedCustomer.dateOfBirth,
        gender: detailedCustomer.gender,
        status: detailedCustomer.status,
        address: detailedCustomer.address,
        insurance: detailedCustomer.insurance,
        allergies: detailedCustomer.allergies.join(", "),
        notes: detailedCustomer.notes,
      })

      // Abrir el diálogo de edición
      setSelectedCustomer(detailedCustomer)
      setIsEditDialogOpen(true)
    } catch (error) {
      console.error("Error al cargar cliente para editar:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el cliente para editar.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Añadir esta función de validación antes de handleAddCustomer
  const validateCustomerForm = (): boolean => {
    const errors: ValidationErrors = {}
    let isValid = true

    // Validar campos obligatorios
    if (!customerForm.name.trim()) {
      errors.name = "El nombre es obligatorio"
      isValid = false
    }

    if (!customerForm.email.trim()) {
      errors.email = "El email es obligatorio"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(customerForm.email)) {
      errors.email = "El formato del email no es válido"
      isValid = false
    }

    if (!customerForm.phone.trim()) {
      errors.phone = "El teléfono es obligatorio"
      isValid = false
    }

    if (!customerForm.dateOfBirth) {
      errors.dateOfBirth = "La fecha de nacimiento es obligatoria"
      isValid = false
    } else {
      const birthDate = parseISO(customerForm.dateOfBirth)
      const today = new Date()
      const age = differenceInYears(today, birthDate)

      if (isAfter(birthDate, today)) {
        errors.dateOfBirth = "La fecha no puede ser futura"
        isValid = false
      } else if (age < 18) {
        errors.dateOfBirth = "El cliente debe ser mayor de 18 años"
        isValid = false
      } else if (age > 120) {
        errors.dateOfBirth = "La fecha no parece válida"
        isValid = false
      }
    }

    if (!customerForm.gender) {
      errors.gender = "El género es obligatorio"
      isValid = false
    }

    if (!customerForm.status) {
      errors.status = "El estado es obligatorio"
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  // Modificar la función handleAddCustomer para incluir la validación
  const handleAddCustomer = async () => {
    // Validar el formulario antes de procesar
    if (!validateCustomerForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, complete correctamente todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Enviar los datos del nuevo cliente a la API
      await CustomerService.createCustomer(customerForm)

      // Mostrar notificación de éxito
      toast({
        title: "Cliente añadido",
        description: `${customerForm.name} ha sido añadido correctamente.`,
      })

      // Resetear el formulario y cerrar el diálogo
      resetCustomerForm()
      setIsAddDialogOpen(false)

      // Recargar la lista de clientes
      loadCustomers()
    } catch (error) {
      console.error("Error al añadir cliente:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el cliente. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Modificar la función handleSaveEditedCustomer para incluir la validación
  const handleSaveEditedCustomer = async () => {
    if (!selectedCustomer) return

    // Validar el formulario antes de procesar
    if (!validateCustomerForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, complete correctamente todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Enviar los datos actualizados a la API
      await CustomerService.updateCustomer(selectedCustomer.id, customerForm)

      // Mostrar notificación de éxito
      toast({
        title: "Cliente actualizado",
        description: `Los datos de ${customerForm.name} han sido actualizados correctamente.`,
      })

      // Cerrar el diálogo y resetear estados
      setIsEditDialogOpen(false)
      setSelectedCustomer(null)
      resetCustomerForm()

      // Recargar la lista de clientes
      loadCustomers()
    } catch (error) {
      console.error("Error al actualizar cliente:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el cliente. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Función para manejar la eliminación de un cliente
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return

    setIsProcessing(true)

    try {
      // Eliminar el cliente a través de la API
      await CustomerService.deleteCustomer(customerToDelete.id)

      // Mostrar notificación de éxito
      toast({
        title: "Cliente eliminado",
        description: `${customerToDelete.name} ha sido eliminado correctamente.`,
      })

      // Cerrar el diálogo de confirmación
      setIsDeleteDialogOpen(false)
      setCustomerToDelete(null)

      // Recargar la lista de clientes
      loadCustomers()
    } catch (error) {
      console.error("Error al eliminar cliente:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Función para abrir el diálogo de confirmación de eliminación
  const confirmDelete = (customer: Customer) => {
    setCustomerToDelete(customer)
    setIsDeleteDialogOpen(true)
  }

  // Función para exportar datos de clientes en diferentes formatos
  const exportCustomersData = async (format: "csv" | "excel" | "pdf") => {
    setIsExporting(true)

    try {
      // Obtener todos los clientes para la exportación
      // En una implementación real, esto podría ser una llamada API específica para exportación
      const result = await CustomerService.getCustomers(
        "", // Sin filtro de búsqueda
        "all", // Todos los estados
        1, // Primera página
        1000, // Límite alto para obtener la mayoría de los clientes
        "name", // Ordenar por nombre
        "asc", // Orden ascendente
      )

      // Exportar los datos usando la utilidad de exportación
      exportCustomers(result.customers, format)

      // Mostrar notificación de éxito
      toast({
        title: "Exportación completada",
        description: `Los datos de clientes han sido exportados en formato ${format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error(`Error al exportar clientes en formato ${format}:`, error)
      toast({
        title: "Error de exportación",
        description: `No se pudieron exportar los datos en formato ${format}. Intente nuevamente.`,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Función para manejar el cierre del diálogo de añadir cliente
  const handleAddDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetCustomerForm()
    }
    setIsAddDialogOpen(open)
  }

  // Función para manejar el cierre del diálogo de editar cliente
  const handleEditDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetCustomerForm()
      setSelectedCustomer(null)
    }
    setIsEditDialogOpen(open)
  }

  // Efecto para resetear la página actual cuando cambia el filtro o la búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  return {
    // Datos
    stats,
    customers,
    selectedCustomer,
    customerToDelete,

    // Estados
    searchTerm,
    statusFilter,
    sortConfig,
    currentPage,
    itemsPerPage,
    customerForm,
    isAddDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isProcessing,
    isExporting,
    isLoading,

    // Añadir esto a las propiedades existentes
    validationErrors,

    // Cálculos para paginación
    totalPages,
    totalItems,
    indexOfFirstItem: (currentPage - 1) * itemsPerPage + 1,
    indexOfLastItem: Math.min(currentPage * itemsPerPage, totalItems),

    // Funciones
    setSearchTerm,
    setStatusFilter,
    requestSort,
    handleViewDetails,
    nextPage,
    prevPage,
    changeItemsPerPage,
    handleCustomerFormChange,
    handleSelectChange,
    handleEditCustomer,
    handleSaveEditedCustomer,
    handleAddCustomer,
    handleDeleteCustomer,
    confirmDelete,
    exportCustomersData,
    setIsAddDialogOpen: handleAddDialogOpenChange,
    setIsEditDialogOpen: handleEditDialogOpenChange,
    setIsDeleteDialogOpen,
    setSelectedCustomer,
    resetCustomerForm,
  }
}

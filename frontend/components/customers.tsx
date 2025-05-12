"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useCustomers } from "@/hooks/use-customers"
import { StatsCards } from "./customers/stats-cards"
import { SearchAndFilter } from "./customers/search-and-filter"
import { ExportMenu } from "./customers/export-menu"
import { AddCustomerDialog } from "./customers/add-customer-dialog"
import { EditCustomerDialog } from "./customers/edit-customer-dialog"
import { DeleteCustomerDialog } from "./customers/delete-customer-dialog"
import { CustomersTable } from "./customers/customers-table"
import { EmptyState } from "./customers/empty-state"
import { Pagination } from "./customers/pagination"
import { CustomerDetails } from "./customers/customer-details"

// Interfaz para el formulario de nuevo cliente
interface CustomerForm {
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  status: string
  address: string
  insurance: string
  allergies: string
  notes: string
}

// Formulario vacío para inicializar
const emptyCustomerForm: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "Masculino",
  status: "active",
  address: "",
  insurance: "",
  allergies: "",
  notes: "",
}

export default function Customers() {
  // Estados para búsqueda y filtros
  const {
    // Datos
    stats,
    customers,
    filteredCustomers,
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
    validationErrors,

    // Cálculos para paginación
    totalPages,
    totalItems,
    indexOfFirstItem,
    indexOfLastItem,

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
    setIsAddDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setSelectedCustomer,
    resetCustomerForm,
  } = useCustomers()

  // Función para cerrar el modal de detalles
  const handleCloseDetailsModal = () => {
    setSelectedCustomer(null)
  }

  // Función para abrir el modal de edición desde el modal de detalles
  const handleEditFromDetails = (customerId: string) => {
    // Primero cerramos el modal de detalles
    setSelectedCustomer(null)

    // Luego abrimos el modal de edición con el cliente seleccionado
    const customerToEdit = customers.find((c) => c.id === customerId)
    if (customerToEdit) {
      handleEditCustomer(customerToEdit)
    }
  }

  // Función para manejar el cierre del modal de añadir cliente
  const handleAddDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open)
    if (!open) {
      // Limpiar el formulario cuando se cierra el modal
      resetCustomerForm()
    }
  }

  // Función para manejar el cierre del modal de editar cliente
  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open)
    if (!open) {
      // Limpiar el formulario y el cliente seleccionado cuando se cierra el modal
      resetCustomerForm()
      setSelectedCustomer(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with search and actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
        <div className="flex gap-2">
          <ExportMenu onExport={exportCustomersData} isExporting={isExporting} disabled={customers.length === 0} />
          <AddCustomerDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            form={customerForm}
            onChange={handleCustomerFormChange}
            onSelectChange={handleSelectChange}
            onSubmit={handleAddCustomer}
            isProcessing={isProcessing}
            validationErrors={validationErrors}
          />
        </div>
      </div>

      {/* Customer Overview Cards */}
      <StatsCards stats={stats} />

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
          <CardDescription>Gestione sus clientes y vea información detallada.</CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <EmptyState title="No hay clientes" description="No se encontraron clientes con los filtros actuales." />
          ) : (
            <CustomersTable
              customers={customers}
              sortConfig={sortConfig}
              onRequestSort={requestSort}
              onViewDetails={handleViewDetails}
              onEditCustomer={handleEditCustomer}
              onDeleteCustomer={confirmDelete}
            />
          )}
        </CardContent>
        <CardFooter>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            startIndex={indexOfFirstItem}
            endIndex={indexOfLastItem}
            onPageChange={(page) => (page > currentPage ? nextPage() : prevPage())}
            onItemsPerPageChange={changeItemsPerPage}
          />
        </CardFooter>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog
        open={!!selectedCustomer && !isEditDialogOpen}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
      >
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <CustomerDetails
            customer={selectedCustomer}
            onClose={handleCloseDetailsModal}
            onEdit={handleEditFromDetails}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <EditCustomerDialog
        isOpen={isEditDialogOpen}
        onOpenChange={handleEditDialogOpenChange}
        form={customerForm}
        onChange={handleCustomerFormChange}
        onSelectChange={handleSelectChange}
        onSubmit={handleSaveEditedCustomer}
        isProcessing={isProcessing}
        validationErrors={validationErrors}
      />

      {/* Delete Customer Dialog */}
      <DeleteCustomerDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        customer={customerToDelete}
        onConfirm={handleDeleteCustomer}
        isProcessing={isProcessing}
      />
    </div>
  )
}

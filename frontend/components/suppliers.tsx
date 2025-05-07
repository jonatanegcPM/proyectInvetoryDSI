"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useSuppliers } from "@/hooks/use-suppliers"
import { StatsCards } from "./suppliers/stats-cards"
import { SearchAndFilter } from "./suppliers/search-and-filter"
import { ExportMenu } from "./suppliers/export-menu"
import { AddSupplierDialog } from "./suppliers/add-supplier-dialog"
import { EditSupplierDialog } from "./suppliers/edit-supplier-dialog"
import { DeleteSupplierDialog } from "./suppliers/delete-supplier-dialog"
import { SuppliersTable } from "./suppliers/suppliers-table"
import { OrdersTable } from "./suppliers/orders-table"
import { EmptyState } from "./suppliers/empty-state"
import { Pagination } from "./suppliers/pagination"
import { SupplierDetails } from "./suppliers/supplier-details"
import { NewOrderDialog } from "./suppliers/new-order-dialog"
import { OrderDetailsDialog } from "./suppliers/order-details-dialog"

export default function Suppliers() {
  const [activeTab, setActiveTab] = useState("suppliers")

  const {
    // Datos
    stats,
    suppliers,
    filteredSuppliers,
    selectedSupplier,
    supplierToDelete,
    supplierProducts,
    supplierOrders,
    orders,
    allOrders,
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
  } = useSuppliers()

  const currentSuppliers = filteredSuppliers.length > 0 ? filteredSuppliers : suppliers

  return (
    <div className="flex flex-col gap-6">
      {/* Header with search and actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
        />
        <div className="flex gap-2">
          <ExportMenu
            onExport={exportSuppliersData}
            isExporting={isExporting}
            disabled={filteredSuppliers.length === 0}
          />
          <AddSupplierDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            form={supplierForm}
            onChange={handleSupplierFormChange}
            onSelectChange={handleSelectChange}
            onSubmit={handleAddSupplier}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      {/* Supplier Overview Cards */}
      <StatsCards stats={stats} />

      {/* Tabs for Suppliers and Orders */}
      <Tabs defaultValue="suppliers" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
        </TabsList>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>Proveedores</CardTitle>
              <CardDescription>Gestione sus proveedores y vea información detallada.</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSuppliers.length === 0 ? (
                <EmptyState />
              ) : (
                <SuppliersTable
                  suppliers={currentSuppliers}
                  sortConfig={sortConfig}
                  onRequestSort={requestSort}
                  onViewDetails={handleViewDetails}
                  onEditSupplier={handleEditSupplier}
                  onDeleteSupplier={confirmDelete}
                  onNewOrder={handleNewOrder}
                />
              )}
            </CardContent>
            <CardFooter>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredSuppliers.length}
                startIndex={indexOfFirstItem}
                endIndex={indexOfLastItem}
                onPageChange={(page) => (page > currentPage ? nextPage() : prevPage())}
                onItemsPerPageChange={(value) => changeItemsPerPage(value)}
              />
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos a Proveedores</CardTitle>
              <CardDescription>Gestione y revise los pedidos realizados a sus proveedores.</CardDescription>
            </CardHeader>
            <CardContent>
              {allOrders.length === 0 ? (
                <EmptyState message="No hay pedidos registrados" />
              ) : (
                <OrdersTable
                  orders={orders}
                  sortConfig={orderSortConfig}
                  onRequestSort={requestOrderSort}
                  onViewOrderDetails={handleViewOrderDetails}
                />
              )}
            </CardContent>
            <CardFooter>
              {allOrders.length > 0 && (
                <Pagination
                  currentPage={ordersCurrentPage}
                  totalPages={ordersTotalPages}
                  itemsPerPage={ordersItemsPerPage}
                  totalItems={allOrders.length}
                  startIndex={ordersIndexOfFirstItem}
                  endIndex={ordersIndexOfLastItem}
                  onPageChange={(page) => (page > ordersCurrentPage ? nextOrdersPage() : prevOrdersPage())}
                  onItemsPerPageChange={(value) => changeOrdersItemsPerPage(value)}
                />
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Supplier Details Dialog */}
      <Dialog
        open={!!selectedSupplier && !isEditDialogOpen}
        onOpenChange={(open) => !open && setSelectedSupplier(null)}
      >
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <SupplierDetails
            supplier={selectedSupplier}
            products={supplierProducts}
            orders={supplierOrders}
            onNewOrder={handleNewOrder}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <EditSupplierDialog
        isOpen={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          // Si se está cerrando el diálogo, limpiar el proveedor seleccionado
          if (!open) {
            setSelectedSupplier(null)
          }
        }}
        form={supplierForm}
        onChange={handleSupplierFormChange}
        onSelectChange={handleSelectChange}
        onSubmit={handleSaveEditedSupplier}
        isProcessing={isProcessing}
      />

      {/* Delete Supplier Dialog */}
      <DeleteSupplierDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        supplier={supplierToDelete}
        onConfirm={handleDeleteSupplier}
        isProcessing={isProcessing}
      />

      {/* New Order Dialog */}
      <NewOrderDialog
        isOpen={isNewOrderDialogOpen}
        onOpenChange={setIsNewOrderDialogOpen}
        supplier={supplierForNewOrder}
        onSubmit={handleCreateOrder}
        isProcessing={isProcessing}
      />

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        order={selectedOrder}
        isOpen={isOrderDetailsDialogOpen}
        onOpenChange={setIsOrderDetailsDialogOpen}
      />
    </div>
  )
}

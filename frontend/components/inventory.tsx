"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
import { useState, useEffect } from "react"

import { useInventory } from "@/hooks/use-inventory"
import { StatsCards } from "@/components/inventory/stats-cards"
import { SearchAndFilter } from "@/components/inventory/search-and-filter"
import { ProductsTable } from "@/components/inventory/products-table"
import { TransactionsTable } from "@/components/inventory/transactions-table"
import { TablePagination } from "@/components/inventory/table-pagination"
import { AddProductDialog } from "@/components/inventory/add-product-dialog"
import { EditProductDialog } from "@/components/inventory/edit-product-dialog"
import { AdjustStockDialog } from "@/components/inventory/adjust-stock-dialog"
import { DeleteProductDialog } from "@/components/inventory/delete-product-dialog"
import { ProductDetailsDialog } from "@/components/inventory/product-details-dialog"
import { ProductHistoryDialog } from "@/components/inventory/product-history-dialog"

import { getSuppliers } from "@/services/inventory-service"
import type { Supplier } from "@/types/inventory"

export default function Inventory() {
  const inventory = useInventory()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const response = await getSuppliers()
        setSuppliers(response.suppliers)
      } catch (error) {
        console.error("Error al cargar los proveedores:", error)
        setSuppliers([])
      }
    }

    loadSuppliers()
  }, [])

  const handleAddProductDialogOpenChange = (open: boolean) => {
    inventory.setIsAddDialogOpen(open)
    if (!open) {
      // Limpiar el formulario cuando se cierra
      inventory.setNewProduct({
        name: "",
        sku: "",
        barcode: "",
        categoryId: null,
        description: "",
        stock: 0,
        reorderLevel: 0,
        price: 0,
        costPrice: 0,
        supplierId: null,
        expiryDate: "",
        location: "",
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with search and actions */}
      <SearchAndFilter
        searchTerm={inventory.searchTerm}
        setSearchTerm={inventory.setSearchTerm}
        selectedCategory={inventory.selectedCategory}
        setSelectedCategory={inventory.setSelectedCategory}
        categories={inventory.categories}
        onExportClick={inventory.handleExportInventory}
        onAddProductClick={() => inventory.setIsAddDialogOpen(true)}
        isSubmitting={inventory.isSubmitting}
        noData={inventory.products.length === 0}
      />

      {/* Inventory Overview Cards */}
      <StatsCards stats={inventory.stats} />

      {/* Inventory Tabs */}
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventario de Productos</CardTitle>
              <CardDescription>Gestione su inventario de productos y medicamentos.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductsTable
                products={inventory.products}
                isLoading={inventory.isLoading}
                onSort={inventory.requestSort}
                onViewDetails={(product) => inventory.setSelectedProduct(product)}
                onEdit={(product) => {
                  inventory.setProductToEdit(product)
                  inventory.setIsEditDialogOpen(true)
                }}
                onAdjustStock={(product) => {
                  inventory.setProductToAdjust(product)
                  inventory.setIsAdjustDialogOpen(true)
                }}
                onViewHistory={inventory.handleViewProductHistory}
                onDelete={(product) => {
                  inventory.setProductToDelete(product)
                  inventory.setIsDeleteDialogOpen(true)
                }}
              />
            </CardContent>
            <CardFooter>
              <TablePagination
                currentPage={inventory.currentPage}
                totalPages={inventory.totalPages}
                itemsPerPage={inventory.itemsPerPage}
                totalItems={inventory.totalItems}
                startIndex={inventory.indexOfFirstItem}
                endIndex={inventory.indexOfLastItem}
                onPageChange={inventory.setCurrentPage}
                onItemsPerPageChange={(items) => {
                  inventory.setItemsPerPage(Number(items))
                  inventory.setCurrentPage(1)
                }}
              />
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transacciones de Inventario</CardTitle>
              <CardDescription>Historial de movimientos de inventario.</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsTable transactions={inventory.transactions} />
            </CardContent>
            <CardFooter>
              <TablePagination
                currentPage={inventory.currentTransactionPage}
                totalPages={inventory.totalTransactionPages}
                itemsPerPage={inventory.transactionsPerPage}
                totalItems={inventory.totalTransactions}
                startIndex={inventory.indexOfFirstTransaction}
                endIndex={inventory.indexOfLastTransaction}
                onPageChange={inventory.setCurrentTransactionPage}
                onItemsPerPageChange={(items) => {
                  inventory.setTransactionsPerPage(Number(items))
                  inventory.setCurrentTransactionPage(1)
                }}
              />
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddProductDialog
        open={inventory.isAddDialogOpen}
        onOpenChange={handleAddProductDialogOpenChange}
        newProduct={inventory.newProduct}
        setNewProduct={inventory.setNewProduct}
        onSave={inventory.handleAddProduct}
        isSubmitting={inventory.isSubmitting}
        categories={inventory.categories}
        suppliers={suppliers}
      />

      <EditProductDialog
        open={inventory.isEditDialogOpen}
        onOpenChange={inventory.setIsEditDialogOpen}
        product={inventory.productToEdit}
        setProduct={inventory.setProductToEdit}
        onSave={inventory.handleEditProduct}
        isSubmitting={inventory.isSubmitting}
        categories={inventory.categories}
        suppliers={suppliers}
      />

      <AdjustStockDialog
        open={inventory.isAdjustDialogOpen}
        onOpenChange={inventory.setIsAdjustDialogOpen}
        product={inventory.productToAdjust}
        adjustmentData={inventory.adjustmentData}
        setAdjustmentData={inventory.setAdjustmentData}
        onSave={inventory.handleAdjustStock}
        isSubmitting={inventory.isSubmitting}
      />

      <DeleteProductDialog
        open={inventory.isDeleteDialogOpen}
        onOpenChange={inventory.setIsDeleteDialogOpen}
        product={inventory.productToDelete}
        onDelete={inventory.handleDeleteProduct}
        isSubmitting={inventory.isSubmitting}
      />

      <Dialog open={!!inventory.selectedProduct} onOpenChange={(open) => !open && inventory.setSelectedProduct(null)}>
        <ProductDetailsDialog
          product={inventory.selectedProduct}
          onOpenChange={(open) => !open && inventory.setSelectedProduct(null)}
          onViewHistory={() => {
            if (inventory.selectedProduct) {
              inventory.handleViewProductHistory(inventory.selectedProduct)
              inventory.setSelectedProduct(null)
            }
          }}
          onAdjustStock={() => {
            inventory.setProductToAdjust(inventory.selectedProduct)
            inventory.setIsAdjustDialogOpen(true)
            inventory.setSelectedProduct(null)
          }}
        />
      </Dialog>

      <ProductHistoryDialog
        open={inventory.isHistoryDialogOpen}
        onOpenChange={inventory.setIsHistoryDialogOpen}
        product={inventory.selectedProductHistory}
        transactions={inventory.productHistoryTransactions}
        isLoading={inventory.isLoadingHistory}
      />
    </div>
  )
}

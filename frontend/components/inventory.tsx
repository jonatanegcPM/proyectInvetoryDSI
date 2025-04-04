"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"

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
import { ExportDialog } from "@/components/inventory/export-dialog"

export default function Inventory() {
  const inventory = useInventory()

  return (
    <div className="flex flex-col gap-6">
      {/* Header with search and actions */}
      <SearchAndFilter
        searchTerm={inventory.searchTerm}
        setSearchTerm={inventory.setSearchTerm}
        selectedCategory={inventory.selectedCategory}
        setSelectedCategory={inventory.setSelectedCategory}
        onExportClick={() => inventory.setIsImportExportOpen(true)}
        onAddProductClick={() => inventory.setIsAddDialogOpen(true)}
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
                products={inventory.currentItems}
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
                onViewHistory={(product) => {
                  inventory.setSelectedProductHistory(product)
                  inventory.setIsHistoryDialogOpen(true)
                }}
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
                totalItems={inventory.sortedProducts.length}
                startIndex={inventory.indexOfFirstItem}
                endIndex={inventory.indexOfLastItem}
                onPageChange={inventory.setCurrentPage}
                onItemsPerPageChange={(items) => {
                  inventory.setItemsPerPage(items)
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
              <TransactionsTable transactions={inventory.currentTransactions} />
            </CardContent>
            <CardFooter>
              <TablePagination
                currentPage={inventory.currentTransactionPage}
                totalPages={inventory.totalTransactionPages}
                itemsPerPage={inventory.transactionsPerPage}
                totalItems={inventory.currentTransactions.length}
                startIndex={inventory.indexOfFirstTransaction}
                endIndex={inventory.indexOfLastTransaction}
                onPageChange={inventory.setCurrentTransactionPage}
                onItemsPerPageChange={(items) => {
                  inventory.setTransactionsPerPage(items)
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
        onOpenChange={inventory.setIsAddDialogOpen}
        newProduct={inventory.newProduct}
        setNewProduct={inventory.setNewProduct}
        onSave={inventory.handleAddProduct}
        isSubmitting={inventory.isSubmitting}
      />

      <EditProductDialog
        open={inventory.isEditDialogOpen}
        onOpenChange={inventory.setIsEditDialogOpen}
        product={inventory.productToEdit}
        setProduct={inventory.setProductToEdit}
        onSave={inventory.handleEditProduct}
        isSubmitting={inventory.isSubmitting}
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

      <ExportDialog
        open={inventory.isImportExportOpen}
        onOpenChange={inventory.setIsImportExportOpen}
        onExport={inventory.handleExportInventory}
        isSubmitting={inventory.isSubmitting}
      />

      <Dialog open={!!inventory.selectedProduct} onOpenChange={(open) => !open && inventory.setSelectedProduct(null)}>
        <ProductDetailsDialog
          product={inventory.selectedProduct}
          onOpenChange={(open) => !open && inventory.setSelectedProduct(null)}
          onViewHistory={() => {
            inventory.setSelectedProductHistory(inventory.selectedProduct)
            inventory.setIsHistoryDialogOpen(true)
            inventory.setSelectedProduct(null)
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
        transactions={
          inventory.selectedProductHistory ? inventory.getProductHistory(inventory.selectedProductHistory) : []
        }
      />
    </div>
  )
}


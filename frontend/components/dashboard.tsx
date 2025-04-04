"use client"
import { DollarSign, ShoppingCart, Users, Package, Clipboard, BarChart4 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// Hooks personalizados
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useTransactionDetails } from "@/hooks/use-transaction-details"
import { useInventoryDetails } from "@/hooks/use-inventory-details"

// Componentes
import { StatsCard } from "@/components/dashboard/stats-card"
import { SearchBar } from "@/components/dashboard/search-bar"
import { DateFilter } from "@/components/dashboard/date-filter"
import { Pagination } from "@/components/dashboard/pagination"
import { TransactionsTable } from "@/components/dashboard/transactions-table"
import { InventoryTable } from "@/components/dashboard/inventory-table"
import { QuickAction } from "@/components/dashboard/quick-action"
import { TransactionDetailsModal } from "@/components/dashboard/transaction-details-modal"
import { OrderProductModal } from "@/components/dashboard/order-product-modal"
import { ExportMenu } from "@/components/dashboard/export-menu"
import { NewSaleButton } from "@/components/dashboard/new-sale-button"

export default function Dashboard() {
  // Obtener datos y funciones de los hooks personalizados
  const {
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    currentTransactions,
    currentInventory,
    searchedTransactions,
    searchedInventory,
    currentTransactionPage,
    setCurrentTransactionPage,
    transactionsPerPage,
    setTransactionsPerPage,
    totalTransactionPages,
    indexOfFirstTransaction,
    indexOfLastTransaction,
    currentInventoryPage,
    setCurrentInventoryPage,
    inventoryPerPage,
    setInventoryPerPage,
    totalInventoryPages,
    indexOfFirstInventoryItem,
    indexOfLastInventoryItem,
  } = useDashboardData()

  const { selectedTransaction, isTransactionDetailsOpen, setIsTransactionDetailsOpen, handleViewTransactionDetails } =
    useTransactionDetails()

  const { selectedInventoryItem, isOrderDialogOpen, setIsOrderDialogOpen, handleOrderProduct } = useInventoryDetails()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center w-full sm:w-auto">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Buscar medicamentos, clientes, ventas..."
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ExportMenu />
          <NewSaleButton />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Resumen</h2>
        <DateFilter dateFilter={dateFilter} setDateFilter={setDateFilter} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Ventas Totales"
          value="$12,548.75"
          description="+18.2% desde el mes pasado"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatsCard
          title="Transacciones"
          value="587"
          description="+7.2% desde el mes pasado"
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatsCard
          title="Clientes"
          value="287"
          description="+12.5% desde el mes pasado"
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          title="Productos con Bajo Stock"
          value="24"
          description="Requieren atención"
          icon={<Package className="h-4 w-4" />}
        />
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="recent-transactions">
        <TabsList>
          <TabsTrigger value="recent-transactions">Transacciones Recientes</TabsTrigger>
          <TabsTrigger value="inventory">Estado del Inventario</TabsTrigger>
        </TabsList>
        <TabsContent value="recent-transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transacciones Recientes</CardTitle>
              <CardDescription>
                {dateFilter === "today"
                  ? "Transacciones de hoy"
                  : dateFilter === "week"
                    ? "Transacciones de esta semana"
                    : dateFilter === "month"
                      ? "Transacciones de este mes"
                      : "Todas las transacciones"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsTable transactions={currentTransactions} onViewDetails={handleViewTransactionDetails} />
            </CardContent>
            <CardFooter>
              <Pagination
                currentPage={currentTransactionPage}
                totalPages={totalTransactionPages}
                itemsPerPage={transactionsPerPage}
                totalItems={searchedTransactions.length}
                onPageChange={setCurrentTransactionPage}
                onItemsPerPageChange={setTransactionsPerPage}
                startIndex={indexOfFirstTransaction}
                endIndex={indexOfLastTransaction}
              />
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado del Inventario</CardTitle>
              <CardDescription>Productos que requieren atención</CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTable inventory={currentInventory} onOrderProduct={handleOrderProduct} />
            </CardContent>
            <CardFooter>
              <Pagination
                currentPage={currentInventoryPage}
                totalPages={totalInventoryPages}
                itemsPerPage={inventoryPerPage}
                totalItems={searchedInventory.length}
                onPageChange={setCurrentInventoryPage}
                onItemsPerPageChange={setInventoryPerPage}
                startIndex={indexOfFirstInventoryItem}
                endIndex={indexOfLastInventoryItem}
              />
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <div>
                <QuickAction
                  icon={<ShoppingCart className="h-8 w-8" />}
                  title="Nueva Venta"
                  description="Procesar una nueva transacción"
                  onClick={() => {}}
                />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nueva Venta</DialogTitle>
                <DialogDescription>Inicia una nueva transacción de venta.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p>Esta funcionalidad te redirigirá al módulo de Punto de Venta.</p>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button>Ir a Punto de Venta</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <div>
                <QuickAction
                  icon={<Package className="h-8 w-8" />}
                  title="Gestionar Inventario"
                  description="Revisar y actualizar el inventario"
                  onClick={() => {}}
                />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Gestionar Inventario</DialogTitle>
                <DialogDescription>Accede al módulo de gestión de inventario.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p>Esta funcionalidad te redirigirá al módulo de Inventario.</p>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button>Ir a Inventario</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <div>
                <QuickAction
                  icon={<Clipboard className="h-8 w-8" />}
                  title="Generar Reporte"
                  description="Crear informes y análisis"
                  onClick={() => {}}
                />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Generar Reporte</DialogTitle>
                <DialogDescription>Crea informes personalizados para tu farmacia.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p>Esta funcionalidad te redirigirá al módulo de Reportes.</p>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button>Ir a Reportes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <div>
                <QuickAction
                  icon={<BarChart4 className="h-8 w-8" />}
                  title="Ver Estadísticas"
                  description="Analizar el rendimiento"
                  onClick={() => {}}
                />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ver Estadísticas</DialogTitle>
                <DialogDescription>Analiza el rendimiento de tu farmacia.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p>Esta funcionalidad te mostrará estadísticas detalladas.</p>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button>Ver Estadísticas</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Modales */}
      <TransactionDetailsModal
        isOpen={isTransactionDetailsOpen}
        onOpenChange={setIsTransactionDetailsOpen}
        transaction={selectedTransaction}
      />

      <OrderProductModal
        isOpen={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        inventoryItem={selectedInventoryItem}
      />
    </div>
  )
}


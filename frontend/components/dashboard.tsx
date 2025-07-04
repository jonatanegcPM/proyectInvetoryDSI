"use client"
import { motion } from "framer-motion"
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Hooks and services
import { useDashboardApi } from "@/hooks/use-dashboard-api"

// Components
import { DashboardHero } from "@/components/dashboard/dashboard-hero"
import { AnimatedStatsCard } from "@/components/dashboard/animated-stats-card"
import { SearchBar } from "@/components/dashboard/search-bar"
import { DateFilter } from "@/components/dashboard/date-filter"
import { Pagination } from "@/components/dashboard/pagination"
import { AnimatedTransactionsTable } from "@/components/dashboard/animated-transactions-table"
import { InventoryTable } from "@/components/dashboard/inventory-table"
import { TransactionDetailsModal } from "@/components/dashboard/transaction-details-modal"
import { ExportMenu } from "@/components/dashboard/export-menu"
import { NewSaleButton } from "@/components/dashboard/new-sale-button"
import { SalesTrendChart } from "@/components/dashboard/sales-trend-chart"
import { TopProductsChart } from "@/components/dashboard/top-products-chart"

export default function Dashboard() {
  const {
    // Data
    stats,
    transactions,
    transactionsPagination,
    lowStockItems,
    selectedTransaction,
    salesTrendData,
    topSellingProducts,

    // Loading states
    isLoadingStats,
    isLoadingTransactions,
    isLoadingInventory,
    isLoadingTransactionDetails,
    isLoadingChartData,

    // UI states
    error,
    searchTerm,
    dateFilter,
    currentPage,
    itemsPerPage,
    isTransactionDetailsOpen,

    // Actions
    setSearchTerm,
    setDateFilter,
    setCurrentPage,
    setItemsPerPage,
    handleViewTransactionDetails,
    setIsTransactionDetailsOpen,
  } = useDashboardApi()

  // Función para obtener la descripción del período según el filtro
  const getFilterDescription = () => {
    switch (dateFilter) {
      case "day":
        return "Datos de hoy"
      case "week":
        return "Datos de esta semana"
      case "month":
        return "Datos de este mes"
      case "year":
        return "Datos de este año"
      case "all":
        return "Todos los datos"
      default:
        return "Datos de esta semana"
    }
  }

  // Actualizar la función para obtener el texto del período según el filtro
  const getChangePeriodText = () => {
    switch (dateFilter) {
      case "day":
        return "desde ayer"
      case "week":
        return "desde la semana pasada"
      case "month":
        return "desde el mes pasado"
      case "year":
        return "desde el año pasado"
      case "all":
        return "cambio total"
      default:
        return "desde el período anterior"
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Hero Banner */}
      <DashboardHero />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center w-full sm:w-auto">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Buscar medicamentos, clientes, ventas..."
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ExportMenu
            transactions={transactions}
            dateFilter={dateFilter}
            isLoading={isLoadingTransactions || isLoadingStats}
          />
          <NewSaleButton />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <h2 className="text-lg font-semibold">{getFilterDescription()}</h2>
        <DateFilter dateFilter={dateFilter} setDateFilter={setDateFilter} />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedStatsCard
          title="Ventas Totales"
          value={stats ? `$${stats.sales.total.toFixed(2)}` : "$0.00"}
          icon={<DollarSign className="h-4 w-4" />}
          isLoading={isLoadingStats}
          changeValue={stats?.sales.change !== null ? stats?.sales.change : undefined}
          changePeriodText={getChangePeriodText()}
          delay={0}
        />
        <AnimatedStatsCard
          title="Transacciones"
          value={stats ? stats.transactions.count.toString() : "0"}
          icon={<ShoppingCart className="h-4 w-4" />}
          isLoading={isLoadingStats}
          changeValue={stats?.transactions.change !== null ? stats?.transactions.change : undefined}
          changePeriodText={getChangePeriodText()}
          delay={100}
        />
        <AnimatedStatsCard
          title="Clientes Nuevos"
          value={stats ? stats.customers.count.toString() : "0"}
          icon={<Users className="h-4 w-4" />}
          isLoading={isLoadingStats}
          changeValue={stats?.customers.change !== null ? stats?.customers.change : undefined}
          changePeriodText={getChangePeriodText()}
          delay={200}
        />
        <AnimatedStatsCard
          title="Productos con Bajo Stock"
          value={stats ? stats.inventory.lowStock.toString() : "0"}
          description="Requieren atención"
          icon={<Package className="h-4 w-4" />}
          isLoading={isLoadingStats}
          delay={300}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de tendencia de ventas */}
        <SalesTrendChart data={salesTrendData} isLoading={isLoadingChartData} dateFilter={dateFilter} />

        {/* Gráfico de productos más vendidos */}
        <TopProductsChart data={topSellingProducts} isLoading={isLoadingChartData} />
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
                {dateFilter === "day"
                  ? "Ventas de hoy"
                  : dateFilter === "week"
                    ? "Ventas de esta semana"
                    : dateFilter === "month"
                      ? "Ventas de este mes"
                      : dateFilter === "year"
                        ? "Ventas de este año"
                        : "Todas las ventas"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatedTransactionsTable
                transactions={transactions}
                isLoading={isLoadingTransactions}
                onViewDetails={handleViewTransactionDetails}
              />
            </CardContent>
            <CardFooter>
              {transactionsPagination && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={transactionsPagination.pages}
                  itemsPerPage={itemsPerPage}
                  totalItems={transactionsPagination.total}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(value) => {
                    setItemsPerPage(Number.parseInt(value))
                    setCurrentPage(1)
                  }}
                  disabled={isLoadingTransactions}
                />
              )}
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
              <InventoryTable inventory={lowStockItems} isLoading={isLoadingInventory} />
            </CardContent>
            <CardFooter>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(lowStockItems.length / itemsPerPage)}
                itemsPerPage={itemsPerPage}
                totalItems={lowStockItems.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(value) => {
                  setItemsPerPage(Number.parseInt(value))
                  setCurrentPage(1)
                }}
                disabled={isLoadingInventory}
              />
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <TransactionDetailsModal
        isOpen={isTransactionDetailsOpen}
        onOpenChange={setIsTransactionDetailsOpen}
        transaction={selectedTransaction}
        isLoading={isLoadingTransactionDetails}
      />
    </div>
  )
}

// Tipos para las preferencias
export interface DashboardPreferences {
  dateFilter: "day" | "week" | "month" | "year" | "all"
  transactionsPerPage: number
}

export interface PointOfSalePreferences {
  productsPerPage: number
}

export interface InventoryPreferences {
  productsPerPage: number
  transactionsPerPage: number
}

// Añadir esta interfaz para las preferencias de clientes
export interface CustomersPreferences {
  customersPerPage: number
  defaultSortKey: string
  defaultSortDirection: "asc" | "desc"
}

// Añadir esta interfaz para las preferencias de proveedores después de CustomersPreferences
export interface SuppliersPreferences {
  suppliersPerPage: number
  ordersPerPage: number
  defaultSuppliersSortKey: string
  defaultSuppliersSortDirection: "ascending" | "descending"
  defaultOrdersSortKey: string
  defaultOrdersSortDirection: "ascending" | "descending"
}

// Claves para localStorage
const DASHBOARD_PREFERENCES_KEY = "dashboard_preferences"
const POS_PREFERENCES_KEY = "pos_preferences"
const INVENTORY_PREFERENCES_KEY = "inventory_preferences"
const CUSTOMERS_PREFERENCES_KEY = "customers_preferences" // Nueva clave para preferencias de clientes

// Añadir esta clave para localStorage después de CUSTOMERS_PREFERENCES_KEY
const SUPPLIERS_PREFERENCES_KEY = "suppliers_preferences"

// Valores por defecto
const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
  dateFilter: "week",
  transactionsPerPage: 5,
}

const DEFAULT_POS_PREFERENCES: PointOfSalePreferences = {
  productsPerPage: 5,
}

const DEFAULT_INVENTORY_PREFERENCES: InventoryPreferences = {
  productsPerPage: 10,
  transactionsPerPage: 10,
}

// Valores por defecto para preferencias de clientes
const DEFAULT_CUSTOMERS_PREFERENCES: CustomersPreferences = {
  customersPerPage: 5,
  defaultSortKey: "CustomerID",
  defaultSortDirection: "desc",
}

// Añadir estos valores por defecto después de DEFAULT_CUSTOMERS_PREFERENCES
// Valores por defecto para preferencias de proveedores
const DEFAULT_SUPPLIERS_PREFERENCES: SuppliersPreferences = {
  suppliersPerPage: 5,
  ordersPerPage: 5,
  defaultSuppliersSortKey: "name",
  defaultSuppliersSortDirection: "ascending",
  defaultOrdersSortKey: "date",
  defaultOrdersSortDirection: "descending",
}

export const PreferencesService = {
  // Dashboard Preferences
  getDashboardPreferences(): DashboardPreferences {
    try {
      const stored = localStorage.getItem(DASHBOARD_PREFERENCES_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_DASHBOARD_PREFERENCES
    } catch (error) {
      console.error("Error reading dashboard preferences:", error)
      return DEFAULT_DASHBOARD_PREFERENCES
    }
  },

  setDashboardPreferences(preferences: Partial<DashboardPreferences>) {
    try {
      const current = this.getDashboardPreferences()
      const updated = { ...current, ...preferences }
      localStorage.setItem(DASHBOARD_PREFERENCES_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error("Error saving dashboard preferences:", error)
    }
  },

  // Point of Sale Preferences
  getPointOfSalePreferences(): PointOfSalePreferences {
    try {
      const stored = localStorage.getItem(POS_PREFERENCES_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_POS_PREFERENCES
    } catch (error) {
      console.error("Error reading POS preferences:", error)
      return DEFAULT_POS_PREFERENCES
    }
  },

  setPointOfSalePreferences(preferences: Partial<PointOfSalePreferences>) {
    try {
      const current = this.getPointOfSalePreferences()
      const updated = { ...current, ...preferences }
      localStorage.setItem(POS_PREFERENCES_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error("Error saving POS preferences:", error)
    }
  },

  // Inventory Preferences
  getInventoryPreferences(): InventoryPreferences {
    try {
      const stored = localStorage.getItem(INVENTORY_PREFERENCES_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_INVENTORY_PREFERENCES
    } catch (error) {
      console.error("Error reading inventory preferences:", error)
      return DEFAULT_INVENTORY_PREFERENCES
    }
  },

  setInventoryPreferences(preferences: Partial<InventoryPreferences>) {
    try {
      const current = this.getInventoryPreferences()
      const updated = { ...current, ...preferences }
      localStorage.setItem(INVENTORY_PREFERENCES_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error("Error saving inventory preferences:", error)
    }
  },

  // Customers Preferences - Nuevos métodos
  getCustomersPreferences(): CustomersPreferences {
    try {
      const stored = localStorage.getItem(CUSTOMERS_PREFERENCES_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_CUSTOMERS_PREFERENCES
    } catch (error) {
      console.error("Error reading customers preferences:", error)
      return DEFAULT_CUSTOMERS_PREFERENCES
    }
  },

  setCustomersPreferences(preferences: Partial<CustomersPreferences>) {
    try {
      const current = this.getCustomersPreferences()
      const updated = { ...current, ...preferences }
      localStorage.setItem(CUSTOMERS_PREFERENCES_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error("Error saving customers preferences:", error)
    }
  },

  // Suppliers Preferences - Nuevos métodos
  getSuppliersPreferences(): SuppliersPreferences {
    try {
      const stored = localStorage.getItem(SUPPLIERS_PREFERENCES_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_SUPPLIERS_PREFERENCES
    } catch (error) {
      console.error("Error reading suppliers preferences:", error)
      return DEFAULT_SUPPLIERS_PREFERENCES
    }
  },

  setSuppliersPreferences(preferences: Partial<SuppliersPreferences>) {
    try {
      const current = this.getSuppliersPreferences()
      const updated = { ...current, ...preferences }
      localStorage.setItem(SUPPLIERS_PREFERENCES_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error("Error saving suppliers preferences:", error)
    }
  },
}

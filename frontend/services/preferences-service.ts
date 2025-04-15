// Tipos para las preferencias
export interface DashboardPreferences {
  dateFilter: "day" | "week" | "month" | "year" | "all"
  transactionsPerPage: number
}

export interface PointOfSalePreferences {
  productsPerPage: number
}

// Claves para localStorage
const DASHBOARD_PREFERENCES_KEY = "dashboard_preferences"
const POS_PREFERENCES_KEY = "pos_preferences"

// Valores por defecto
const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
  dateFilter: "week",
  transactionsPerPage: 5
}

const DEFAULT_POS_PREFERENCES: PointOfSalePreferences = {
  productsPerPage: 5
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
  }
} 
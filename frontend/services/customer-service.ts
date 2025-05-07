import type { Customer, CustomerForm, CustomerStats } from "@/types/customers"

// Interfaces para comunicación con la API
interface PaginationDTO {
  total: number
  page: number
  limit: number
  pages: number
}

interface CustomerDTO {
  id: number
  name: string
  email: string
  phone: string
  address: string
  dateOfBirth: string | null
  gender: string
  insurance: string
  status: string
  registrationDate: string
  lastVisit: string | null
}

interface CustomerDetailDTO extends CustomerDTO {
  allergies: string
  notes: string
  totalPurchases: number
  totalSpent: number
  purchases: CustomerPurchaseDTO[]
}

interface CustomerPurchaseDTO {
  id: string
  date: string
  items: number
  total: number
  paymentMethod: string
}

interface CustomerCreateDTO {
  name: string
  email: string
  phone: string
  address: string
  dateOfBirth: string | null
  gender: string
  insurance: string
  status: string
  allergies: string
  notes: string
}

interface CustomersResponse {
  customers: CustomerDTO[]
  pagination: PaginationDTO
}

interface CustomerStatsDTO {
  total: number
  active: number
  inactive: number
  newThisMonth: number
  withInsurance: number
}

// Verificar que la URL de la API esté disponible
const API_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_URL) {
  console.warn("La variable de entorno NEXT_PUBLIC_API_URL no está definida. Las solicitudes a la API pueden fallar.")
}

// Función auxiliar para obtener la URL base de la API
const getApiUrl = (endpoint: string): string => {
  // Asegurarse de que endpoint comience con /
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  return `${API_URL || ""}${normalizedEndpoint}`
}

// Función auxiliar para obtener el token de autenticación
const getAuthHeaders = (): HeadersInit => {
  // Obtener el token del localStorage
  const token = localStorage.getItem("auth_token")

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  }
}

// Función para convertir DTO a modelo de cliente
const mapDtoToCustomer = (dto: CustomerDTO): Customer => ({
  id: dto.id.toString(),
  name: dto.name,
  email: dto.email,
  phone: dto.phone,
  address: dto.address,
  dateOfBirth: dto.dateOfBirth || "",
  gender: dto.gender,
  insurance: dto.insurance,
  status: dto.status as "active" | "inactive",
  registrationDate: dto.registrationDate,
  lastVisit: dto.lastVisit || dto.registrationDate,
  allergies: [],
  notes: "",
  totalPurchases: 0,
  totalSpent: 0,
  purchases: [],
})

// Función para convertir DTO detallado a modelo de cliente
const mapDetailDtoToCustomer = (dto: CustomerDetailDTO): Customer => ({
  id: dto.id.toString(),
  name: dto.name,
  email: dto.email,
  phone: dto.phone,
  address: dto.address,
  dateOfBirth: dto.dateOfBirth || "",
  gender: dto.gender,
  insurance: dto.insurance,
  status: dto.status as "active" | "inactive",
  registrationDate: dto.registrationDate,
  lastVisit: dto.lastVisit || dto.registrationDate,
  allergies: dto.allergies ? dto.allergies.split(",").map((a) => a.trim()) : [],
  notes: dto.notes,
  totalPurchases: dto.totalPurchases,
  totalSpent: dto.totalSpent,
  purchases: dto.purchases.map((p) => ({
    id: p.id,
    date: p.date,
    items: p.items,
    total: p.total,
    paymentMethod: p.paymentMethod,
  })),
})

// Función para convertir modelo de formulario a DTO de creación
const mapFormToCreateDto = (form: CustomerForm): CustomerCreateDTO => ({
  name: form.name,
  email: form.email,
  phone: form.phone,
  address: form.address,
  dateOfBirth: form.dateOfBirth || null,
  gender: form.gender,
  insurance: form.insurance,
  status: form.status,
  allergies: form.allergies,
  notes: form.notes,
})

// Servicio para interactuar con la API de clientes
export const CustomerService = {
  // Obtener lista de clientes con filtros y paginación
  async getCustomers(
    search?: string,
    status?: string,
    page = 1,
    limit = 10,
    sort = "name",
    direction = "asc",
  ): Promise<{ customers: Customer[]; pagination: PaginationDTO }> {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (status && status !== "all") params.append("status", status)
    params.append("page", page.toString())
    params.append("limit", limit.toString())
    params.append("sort", sort)
    params.append("direction", direction)

    try {
      const response = await fetch(getApiUrl(`/customers?${params.toString()}`), {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        console.error(`Error al obtener clientes: ${response.status} ${response.statusText}`)
        throw new Error(`Error al obtener clientes: ${response.statusText}`)
      }

      const data: CustomersResponse = await response.json()
      return {
        customers: data.customers.map(mapDtoToCustomer),
        pagination: data.pagination,
      }
    } catch (error) {
      console.error("Error en la solicitud de clientes:", error)
      throw new Error(`Error al obtener clientes: ${error instanceof Error ? error.message : "Error desconocido"}`)
    }
  },

  // Obtener detalles de un cliente
  async getCustomerById(id: string): Promise<Customer> {
    try {
      const response = await fetch(getApiUrl(`/customers/${id}`), {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        console.error(`Error al obtener cliente: ${response.status} ${response.statusText}`)
        throw new Error(`Error al obtener cliente: ${response.statusText}`)
      }

      const data: CustomerDetailDTO = await response.json()
      return mapDetailDtoToCustomer(data)
    } catch (error) {
      console.error(`Error al obtener cliente ${id}:`, error)
      throw new Error(`Error al obtener cliente: ${error instanceof Error ? error.message : "Error desconocido"}`)
    }
  },

  // Crear un nuevo cliente
  async createCustomer(form: CustomerForm): Promise<Customer> {
    try {
      const response = await fetch(getApiUrl("/customers"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(mapFormToCreateDto(form)),
      })

      if (!response.ok) {
        console.error(`Error al crear cliente: ${response.status} ${response.statusText}`)
        throw new Error(`Error al crear cliente: ${response.statusText}`)
      }

      const data: CustomerDTO = await response.json()
      return mapDtoToCustomer(data)
    } catch (error) {
      console.error("Error al crear cliente:", error)
      throw new Error(`Error al crear cliente: ${error instanceof Error ? error.message : "Error desconocido"}`)
    }
  },

  // Actualizar un cliente existente
  async updateCustomer(id: string, form: CustomerForm): Promise<Customer> {
    try {
      const response = await fetch(getApiUrl(`/customers/${id}`), {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(mapFormToCreateDto(form)),
      })

      if (!response.ok) {
        console.error(`Error al actualizar cliente: ${response.status} ${response.statusText}`)
        throw new Error(`Error al actualizar cliente: ${response.statusText}`)
      }

      const data: CustomerDTO = await response.json()
      return mapDtoToCustomer(data)
    } catch (error) {
      console.error(`Error al actualizar cliente ${id}:`, error)
      throw new Error(`Error al actualizar cliente: ${error instanceof Error ? error.message : "Error desconocido"}`)
    }
  },

  // Eliminar un cliente
  async deleteCustomer(id: string): Promise<boolean> {
    try {
      const response = await fetch(getApiUrl(`/customers/${id}`), {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        console.error(`Error al eliminar cliente: ${response.status} ${response.statusText}`)
        throw new Error(`Error al eliminar cliente: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error(`Error al eliminar cliente ${id}:`, error)
      throw new Error(`Error al eliminar cliente: ${error instanceof Error ? error.message : "Error desconocido"}`)
    }
  },

  // Obtener estadísticas de clientes
  async getCustomerStats(): Promise<CustomerStats> {
    try {
      const response = await fetch(getApiUrl("/customers/stats"), {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        console.error(`Error al obtener estadísticas: ${response.status} ${response.statusText}`)
        throw new Error(`Error al obtener estadísticas: ${response.statusText}`)
      }

      const data: CustomerStatsDTO = await response.json()
      return data
    } catch (error) {
      console.error("Error al obtener estadísticas de clientes:", error)
      throw new Error(`Error al obtener estadísticas: ${error instanceof Error ? error.message : "Error desconocido"}`)
    }
  },
}

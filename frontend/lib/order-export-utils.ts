import type { SupplierOrder } from "@/types/suppliers"

/**
 * Exporta los datos de pedidos a formato CSV
 * @param orders Lista de pedidos a exportar
 * @returns Blob con el contenido CSV
 */
export function exportOrdersToCSV(orders: SupplierOrder[]): Blob {
  // Definir las cabeceras
  const headers = ["ID", "Fecha", "Fecha Esperada", "Proveedor", "Productos", "Total", "Estado", "Notas"]

  // Función para escapar valores con comas
  const escapeCSV = (value: string | number | null) => {
    if (value === null || value === undefined) return '""'
    const stringValue = String(value)
    return stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")
      ? `"${stringValue.replace(/"/g, '""')}"`
      : stringValue
  }

  // Convertir los datos a formato CSV
  const csvContent = [
    headers.join(","),
    ...orders.map((order) =>
      [
        order.id,
        formatOrderDate(order.date),
        formatOrderDate(order.expectedDate),
        escapeCSV(order.supplierName || ""),
        order.items,
        formatCurrency(order.total),
        escapeCSV(order.status),
        escapeCSV(order.notes || ""),
      ].join(","),
    ),
  ].join("\n")

  // Añadir BOM (Byte Order Mark) para que Excel reconozca correctamente los caracteres UTF-8
  const BOM = "\uFEFF"
  const csvWithBOM = BOM + csvContent

  // Crear un blob con el contenido CSV y codificación UTF-8
  return new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" })
}

/**
 * Exporta los datos de pedidos a formato JSON
 * @param orders Lista de pedidos a exportar
 * @returns Blob con el contenido JSON
 */
export function exportOrdersToJSON(orders: SupplierOrder[]): Blob {
  // Preparar los datos para exportación JSON
  const jsonData = orders.map((order) => ({
    id: order.id,
    date: formatOrderDate(order.date),
    expectedDate: order.expectedDate ? formatOrderDate(order.expectedDate) : null,
    supplierName: order.supplierName || "",
    supplierId: order.supplierId,
    items: order.items,
    total: order.total,
    totalFormatted: formatCurrency(order.total),
    status: order.status,
    notes: order.notes || "",
    products: order.orderItems
      ? order.orderItems.map((item) => ({
          id: item.productId,
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price,
        }))
      : [],
  }))

  // Convertir a string JSON con formato
  const jsonContent = JSON.stringify(jsonData, null, 2)

  // Crear un blob con el contenido JSON y codificación UTF-8
  return new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
}

/**
 * Formatea una fecha para mostrarla en formato legible
 * @param dateString Fecha en formato string
 * @returns Fecha formateada
 */
function formatOrderDate(dateString?: string): string {
  if (!dateString) return "N/A"

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch (error) {
    return dateString
  }
}

/**
 * Formatea un número como moneda
 * @param value Valor a formatear
 * @returns Valor formateado como moneda
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

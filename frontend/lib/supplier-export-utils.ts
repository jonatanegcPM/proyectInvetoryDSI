import type { Supplier } from "@/types/suppliers"

/**
 * Exporta los datos de proveedores a formato CSV
 * @param suppliers Lista de proveedores a exportar
 * @returns Blob con el contenido CSV
 */
export function exportSuppliersToCSV(suppliers: Supplier[]): Blob {
  // Definir las cabeceras
  const headers = [
    "ID",
    "Nombre",
    "Contacto",
    "Email",
    "Teléfono",
    "Dirección",
    "Categoría",
    "Estado",
    "Productos",
    "Último Pedido",
  ]

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
    ...suppliers.map((supplier) =>
      [
        supplier.id,
        escapeCSV(supplier.name),
        escapeCSV(supplier.contact),
        escapeCSV(supplier.email),
        escapeCSV(supplier.phone),
        escapeCSV(supplier.address),
        escapeCSV(supplier.category),
        supplier.status === "active" ? "Activo" : supplier.status === "inactive" ? "Inactivo" : "Pendiente",
        supplier.products,
        supplier.lastOrder || "N/A",
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
 * Exporta los datos de proveedores a formato JSON
 * @param suppliers Lista de proveedores a exportar
 * @returns Blob con el contenido JSON
 */
export function exportSuppliersToJSON(suppliers: Supplier[]): Blob {
  // Preparar los datos para exportación JSON
  const jsonData = suppliers.map((supplier) => ({
    id: supplier.id,
    name: supplier.name,
    contact: supplier.contact,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    category: supplier.category,
    status: supplier.status === "active" ? "Activo" : supplier.status === "inactive" ? "Inactivo" : "Pendiente",
    products: supplier.products,
    lastOrder: supplier.lastOrder || "N/A",
  }))

  // Convertir a string JSON con formato
  const jsonContent = JSON.stringify(jsonData, null, 2)

  // Crear un blob con el contenido JSON y codificación UTF-8
  return new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
}

/**
 * Descarga un blob como archivo
 * @param blob Blob a descargar
 * @param filename Nombre del archivo
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url) // Liberar memoria
}

/**
 * Genera un nombre de archivo con la fecha actual
 * @param prefix Prefijo del nombre del archivo
 * @param extension Extensión del archivo
 * @returns Nombre del archivo con la fecha actual
 */
export function generateFilename(prefix: string, extension: string): string {
  const date = new Date().toISOString().slice(0, 10)
  return `${prefix}_${date}.${extension}`
}

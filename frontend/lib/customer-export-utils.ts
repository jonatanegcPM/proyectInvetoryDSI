import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { format } from "date-fns"
import type { Customer } from "@/types/customers"

// Colores corporativos
const CORPORATE_COLORS = {
  primary: [22, 160, 133], // Verde principal
  secondary: [39, 174, 96], // Verde secundario
  text: [44, 62, 80], // Color de texto oscuro
  lightText: [127, 140, 141], // Color de texto claro
  background: [236, 240, 241], // Color de fondo claro
}

// Constantes para márgenes y espaciado
const MARGINS = {
  top: 40,
  bottom: 30, // Espacio reservado para el pie de página
  left: 14,
  right: 14,
}

/**
 * Función auxiliar para descargar un Blob como archivo
 * @param blob - El Blob a descargar
 * @param filename - Nombre del archivo
 */
const downloadBlob = (blob: Blob, filename: string): void => {
  // Crear una URL para el blob
  const url = URL.createObjectURL(blob)

  // Crear un elemento <a> para la descarga
  const link = document.createElement("a")
  link.href = url
  link.download = filename

  // Añadir el enlace al documento, hacer clic y luego eliminarlo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Liberar la URL del objeto
  URL.revokeObjectURL(url)
}

/**
 * Añade el logo de la empresa al PDF
 * @param doc - Documento PDF
 * @param x - Posición X
 * @param y - Posición Y
 * @param width - Ancho del logo
 */
const addLogo = (doc: jsPDF, x: number, y: number, width: number): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = "/images/farmacias-brasil-logo-green.png"

    img.onload = () => {
      const aspectRatio = img.height / img.width
      const height = width * aspectRatio

      doc.addImage(img, "PNG", x, y, width, height)
      resolve()
    }

    // Si hay algún error al cargar la imagen, continuamos sin ella
    img.onerror = () => {
      console.error("Error al cargar el logo")
      resolve()
    }
  })
}

/**
 * Añade un encabezado personalizado al PDF
 * @param doc - Documento PDF
 * @param title - Título del documento
 */
const addHeader = async (doc: jsPDF, title: string): Promise<number> => {
  // Añadir rectángulo de color en la parte superior
  doc.setFillColor(CORPORATE_COLORS.primary[0], CORPORATE_COLORS.primary[1], CORPORATE_COLORS.primary[2])
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, "F")

  // Añadir logo
  await addLogo(doc, 14, 10, 40)

  // Añadir título
  doc.setTextColor(255, 255, 255) // Texto blanco
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text(title, 65, 25)

  // Añadir fecha y hora
  const currentDate = format(new Date(), "dd/MM/yyyy HH:mm")
  doc.setTextColor(CORPORATE_COLORS.text[0], CORPORATE_COLORS.text[1], CORPORATE_COLORS.text[2])
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Generado: ${currentDate}`, 14, 50)

  return 60 // Retornar la posición Y donde termina el encabezado
}

/**
 * Añade un pie de página al PDF
 * @param doc - Documento PDF
 */
const addFooter = (doc: jsPDF): void => {
  const pageCount = (doc as any).internal.getNumberOfPages()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  doc.setFontSize(8)
  doc.setTextColor(CORPORATE_COLORS.lightText[0], CORPORATE_COLORS.lightText[1], CORPORATE_COLORS.lightText[2])

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Añadir línea divisoria
    const footerY = pageHeight - MARGINS.bottom + 10
    doc.setDrawColor(CORPORATE_COLORS.primary[0], CORPORATE_COLORS.primary[1], CORPORATE_COLORS.primary[2])
    doc.line(MARGINS.left, footerY, pageWidth - MARGINS.right, footerY)

    // Añadir texto del pie de página
    doc.text("Farmacias Brasil - Sistema de Gestión", MARGINS.left, footerY + 5)
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 30, footerY + 5)
  }
}

/**
 * Añade un resumen estadístico al PDF
 * @param doc - Documento PDF
 * @param customers - Lista de clientes
 * @param startY - Posición Y inicial
 * @returns La posición Y final después del resumen
 */
const addSummary = (doc: jsPDF, customers: Customer[], startY: number): number => {
  const pageHeight = doc.internal.pageSize.getHeight()
  const summaryHeight = 55 // Altura aproximada del resumen

  // Verificar si hay suficiente espacio en la página actual
  if (startY + summaryHeight > pageHeight - MARGINS.bottom) {
    doc.addPage()
    startY = MARGINS.top
  }

  // Añadir título de sección
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(CORPORATE_COLORS.primary[0], CORPORATE_COLORS.primary[1], CORPORATE_COLORS.primary[2])
  doc.text("Resumen", MARGINS.left, startY)

  // Añadir fondo para el resumen
  doc.setFillColor(CORPORATE_COLORS.background[0], CORPORATE_COLORS.background[1], CORPORATE_COLORS.background[2])
  doc.roundedRect(
    MARGINS.left,
    startY + 5,
    doc.internal.pageSize.getWidth() - MARGINS.left - MARGINS.right,
    40,
    3,
    3,
    "F",
  )

  // Añadir estadísticas
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(CORPORATE_COLORS.text[0], CORPORATE_COLORS.text[1], CORPORATE_COLORS.text[2])

  const activeCustomers = customers.filter((c) => c.status === "active").length
  const inactiveCustomers = customers.filter((c) => c.status === "inactive").length
  const insuredCustomers = customers.filter((c) => c.insurance).length
  const totalPurchases = customers.reduce((sum, c) => sum + c.totalPurchases, 0)
  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0)

  doc.text(`Total de clientes: ${customers.length}`, MARGINS.left + 6, startY + 15)
  doc.text(
    `Activos: ${activeCustomers} (${Math.round((activeCustomers / customers.length) * 100)}%)`,
    MARGINS.left + 6,
    startY + 25,
  )
  doc.text(
    `Inactivos: ${inactiveCustomers} (${Math.round((inactiveCustomers / customers.length) * 100)}%)`,
    MARGINS.left + 6,
    startY + 35,
  )
  doc.text(
    `Con seguro: ${insuredCustomers} (${Math.round((insuredCustomers / customers.length) * 100)}%)`,
    MARGINS.left + 96,
    startY + 15,
  )
  doc.text(`Total de compras: ${totalPurchases}`, MARGINS.left + 96, startY + 25)
  doc.text(`Total gastado: $${totalSpent.toFixed(2)}`, MARGINS.left + 96, startY + 35)

  return startY + summaryHeight
}

/**
 * Genera un archivo PDF con los datos de clientes
 * @param customers - Lista de clientes a exportar
 * @param title - Título del documento
 */
export const exportToPDF = async (customers: Customer[], title = "Reporte de Clientes"): Promise<void> => {
  // Crear un nuevo documento PDF
  const doc = new jsPDF()

  // Añadir encabezado
  const headerEndY = await addHeader(doc, title)

  // Preparar datos para la tabla
  const tableColumn = ["ID", "Nombre", "Email", "Teléfono", "Estado", "Seguro", "Última Visita"]
  const tableRows = customers.map((customer) => [
    customer.id,
    customer.name,
    customer.email,
    customer.phone,
    customer.status === "active" ? "Activo" : "Inactivo",
    customer.insurance ? "Sí" : "No",
    format(new Date(customer.lastVisit), "dd/MM/yyyy"),
  ])

  // Generar tabla con margen inferior para el pie de página
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: headerEndY,
    styles: {
      fontSize: 10,
      cellPadding: 3,
      textColor: [44, 62, 80],
    },
    headStyles: {
      fillColor: CORPORATE_COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    margin: {
      top: headerEndY,
      left: MARGINS.left,
      right: MARGINS.right,
      bottom: MARGINS.bottom, // Margen inferior para evitar solapamiento con el pie de página
    },
    didDrawPage: (data) => {
      // Este callback se ejecuta cada vez que se dibuja una página
      // Podríamos añadir lógica adicional aquí si fuera necesario
    },
  })

  // Añadir resumen después de la tabla
  const finalY = (doc as any).lastAutoTable.finalY + 10
  addSummary(doc, customers, finalY)

  // Añadir pie de página
  addFooter(doc)

  // Guardar el PDF
  const pdfOutput = doc.output("blob")
  downloadBlob(pdfOutput, `clientes_${format(new Date(), "yyyy-MM-dd")}.pdf`)
}

/**
 * Escapa correctamente un valor para CSV, manejando acentos y caracteres especiales
 * @param value - Valor a escapar
 * @returns Valor escapado para CSV
 */
const escapeCsvValue = (value: string | number | boolean): string => {
  if (value === null || value === undefined) return ""

  // Convertir a string si no lo es
  const strValue = String(value)

  // Si contiene comas, comillas o saltos de línea, encerrarlo en comillas
  if (/[",\n\r]/.test(strValue)) {
    // Escapar las comillas dobles duplicándolas
    return `"${strValue.replace(/"/g, '""')}"`
  }

  return strValue
}

/**
 * Genera un archivo CSV con los datos de clientes
 * @param customers - Lista de clientes a exportar
 */
export const exportToCSV = (customers: Customer[]): void => {
  // Definir encabezados
  const headers = [
    "ID",
    "Nombre",
    "Email",
    "Teléfono",
    "Dirección",
    "Fecha de Nacimiento",
    "Género",
    "Estado",
    "Seguro",
    "Última Visita",
    "Fecha de Registro",
    "Total de Compras",
    "Total Gastado",
  ]

  // Convertir datos a formato CSV
  const rows = customers.map((customer) => [
    customer.id,
    customer.name,
    customer.email,
    customer.phone,
    customer.address,
    format(new Date(customer.dateOfBirth), "yyyy-MM-dd"),
    customer.gender,
    customer.status === "active" ? "Activo" : "Inactivo",
    customer.insurance ? "Sí" : "No",
    format(new Date(customer.lastVisit), "yyyy-MM-dd"),
    format(new Date(customer.registrationDate), "yyyy-MM-dd"),
    customer.totalPurchases,
    customer.totalSpent.toFixed(2),
  ])

  // Escapar correctamente cada valor
  const escapedRows = rows.map((row) => row.map(escapeCsvValue))

  // Unir filas y columnas
  const csvContent = [headers.map(escapeCsvValue).join(","), ...escapedRows.map((row) => row.join(","))].join("\n")

  // Añadir BOM (Byte Order Mark) para que Excel reconozca UTF-8
  const BOM = "\uFEFF"
  const csvWithBOM = BOM + csvContent

  // Crear blob con codificación UTF-8
  const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8" })
  downloadBlob(blob, `clientes_${format(new Date(), "yyyy-MM-dd")}.csv`)
}

/**
 * Genera un archivo JSON con los datos de clientes
 * @param customers - Lista de clientes a exportar
 */
export const exportToJSON = (customers: Customer[]): void => {
  // Preparar los datos para JSON
  // Podemos formatear o transformar los datos si es necesario
  const jsonData = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    dateOfBirth: customer.dateOfBirth,
    gender: customer.gender,
    status: customer.status,
    insurance: customer.insurance,
    lastVisit: customer.lastVisit,
    registrationDate: customer.registrationDate,
    totalPurchases: customer.totalPurchases,
    totalSpent: customer.totalSpent,
    allergies: customer.allergies,
    notes: customer.notes,
  }))

  // Convertir a string JSON con formato legible (indentación de 2 espacios)
  const jsonString = JSON.stringify(jsonData, null, 2)

  // Crear blob con el contenido JSON
  const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" })
  downloadBlob(blob, `clientes_${format(new Date(), "yyyy-MM-dd")}.json`)
}

/**
 * Función principal para exportar datos de clientes en diferentes formatos
 * @param customers - Lista de clientes a exportar
 * @param format - Formato de exportación (pdf, csv, json)
 */
export const exportCustomers = async (customers: Customer[], format: "pdf" | "csv" | "json"): Promise<void> => {
  switch (format) {
    case "pdf":
      await exportToPDF(customers)
      break
    case "csv":
      exportToCSV(customers)
      break
    case "json":
      exportToJSON(customers)
      break
    default:
      console.error("Formato de exportación no soportado")
  }
}

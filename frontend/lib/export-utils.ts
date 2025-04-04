import jsPDF from "jspdf"
import "jspdf-autotable"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Transaction } from "@/services/dashboard-service"

// Extender el tipo jsPDF para incluir autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

// Función para exportar a PDF
export function exportToPDF(transactions: Transaction[], dateFilter: string): void {
  const doc = new jsPDF()

  // Añadir el logo
  try {
    const logoWidth = 60 // Ancho del logo en mm
    const logoHeight = 20 // Altura aproximada manteniendo la proporción
    doc.addImage("/farmacias-brasil-logo.webp", "WEBP", 15, 10, logoWidth, logoHeight)
  } catch (error) {
    console.error("Error al añadir el logo al PDF:", error)
  }

  // Título y fecha
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text("Reporte de Ventas", 105, 40, { align: "center" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(12)

  // Periodo del reporte
  let periodoTexto = "Todas las ventas"
  switch (dateFilter) {
    case "day":
      periodoTexto = "Ventas del día"
      break
    case "week":
      periodoTexto = "Ventas de la semana"
      break
    case "month":
      periodoTexto = "Ventas del mes"
      break
    case "year":
      periodoTexto = "Ventas del año"
      break
  }

  doc.text(`${periodoTexto} - Generado: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`, 105, 48, {
    align: "center",
  })

  // Preparar datos para la tabla
  const tableColumn = ["ID", "Cliente", "Artículos", "Monto", "Estado", "Fecha"]
  const tableRows = transactions.map((transaction) => {
    const date = new Date(transaction.date)
    const formattedDate = format(date, "dd/MM/yyyy", { locale: es })

    // Formatear el estado
    let estado = ""
    switch (transaction.status) {
      case "completed":
        estado = "Completado"
        break
      case "pending":
        estado = "Pendiente"
        break
      case "cancelled":
        estado = "Cancelado"
        break
    }

    return [
      transaction.id,
      transaction.customer,
      transaction.items.toString(),
      `$${transaction.amount.toFixed(2)}`,
      estado,
      formattedDate,
    ]
  })

  // Generar la tabla
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 60,
    theme: "striped",
    headStyles: { fillColor: [0, 51, 153], textColor: [255, 255, 255] },
    styles: { font: "helvetica", fontSize: 10 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  })

  // Añadir resumen
  const totalVentas = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  const totalTransacciones = transactions.length

  // Agregar un log para depuración
  console.log(`Exportando a PDF: ${totalTransacciones} transacciones con un total de $${totalVentas.toFixed(2)}`)

  const finalY = (doc as any).lastAutoTable.finalY || 150
  doc.setFont("helvetica", "bold")
  doc.text(`Total de Transacciones: ${totalTransacciones}`, 15, finalY + 15)
  doc.text(`Monto Total: $${totalVentas.toFixed(2)}`, 15, finalY + 25)

  // Pie de página
  const pageCount = (doc.internal.pages || []).length - 1
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Página ${i} de ${pageCount} - Farmacias Brasil`, 105, doc.internal.pageSize.height - 10, {
      align: "center",
    })
  }

  // Guardar el PDF
  doc.save(`ventas_${dateFilter}_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`)
}

// Función para exportar a CSV
export function exportToCSV(transactions: Transaction[], dateFilter: string): void {
  // Add logging
  console.log(`Exportando a CSV: ${transactions.length} transacciones para el filtro ${dateFilter}`)
  // Encabezados CSV
  const headers = ["ID", "Cliente", "Artículos", "Monto", "Estado", "Fecha"]

  // Convertir datos a filas CSV
  const rows = transactions.map((transaction) => {
    const date = new Date(transaction.date)
    const formattedDate = format(date, "dd/MM/yyyy", { locale: es })

    // Formatear el estado
    let estado = ""
    switch (transaction.status) {
      case "completed":
        estado = "Completado"
        break
      case "pending":
        estado = "Pendiente"
        break
      case "cancelled":
        estado = "Cancelado"
        break
    }

    return [
      transaction.id,
      transaction.customer.replace(/,/g, " "), // Evitar problemas con comas en nombres
      transaction.items.toString(),
      transaction.amount.toFixed(2),
      estado,
      formattedDate,
    ].join(",")
  })

  // Combinar encabezados y filas
  const csvContent = [headers.join(","), ...rows].join("\n")

  // Añadir BOM (Byte Order Mark) para UTF-8
  const BOM = "\uFEFF"
  const csvContentWithBOM = BOM + csvContent

  // Crear blob con la codificación UTF-8 explícita
  const blob = new Blob([csvContentWithBOM], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `ventas_${dateFilter}_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Función para exportar a Excel (usando CSV como alternativa simple)
export function exportToExcel(transactions: Transaction[], dateFilter: string): void {
  // Add logging
  console.log(`Exportando a Excel: ${transactions.length} transacciones para el filtro ${dateFilter}`)
  // En un entorno real, usaríamos una biblioteca como ExcelJS
  // Para simplificar, usaremos el mismo enfoque CSV pero con extensión .xlsx

  // Encabezados
  const headers = ["ID", "Cliente", "Artículos", "Monto", "Estado", "Fecha"]

  // Convertir datos a filas
  const rows = transactions.map((transaction) => {
    const date = new Date(transaction.date)
    const formattedDate = format(date, "dd/MM/yyyy", { locale: es })

    // Formatear el estado
    let estado = ""
    switch (transaction.status) {
      case "completed":
        estado = "Completado"
        break
      case "pending":
        estado = "Pendiente"
        break
      case "cancelled":
        estado = "Cancelado"
        break
    }

    return [
      transaction.id,
      transaction.customer.replace(/,/g, " "), // Evitar problemas con comas en nombres
      transaction.items.toString(),
      transaction.amount.toFixed(2),
      estado,
      formattedDate,
    ].join(",")
  })

  // Combinar encabezados y filas
  const csvContent = [headers.join(","), ...rows].join("\n")

  // Crear blob y descargar
  const blob = new Blob([csvContent], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `ventas_${dateFilter}_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}


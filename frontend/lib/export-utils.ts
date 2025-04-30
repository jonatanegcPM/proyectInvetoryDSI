import jsPDF from "jspdf"
import "jspdf-autotable"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Transaction } from "@/services/dashboard-service"
import type { Product } from "@/types/inventory"

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
    doc.addImage("/farmacias-brasil-logo.jpg", "JPG", 15, 10, logoWidth, logoHeight)
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

  // Crear blob y descargar
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

  // Añadir BOM (Byte Order Mark) para UTF-8
  const BOM = "\uFEFF"
  const csvContentWithBOM = BOM + csvContent

  // Crear blob y descargar
  const blob = new Blob([csvContentWithBOM], {
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

// Función para crear un degradado en el PDF
function addGradientBackground(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  color1: number[],
  color2: number[],
): void {
  const totalSteps = 40
  const stepHeight = height / totalSteps

  for (let i = 0; i < totalSteps; i++) {
    const ratio = i / totalSteps
    const r = Math.floor(color1[0] + ratio * (color2[0] - color1[0]))
    const g = Math.floor(color1[1] + ratio * (color2[1] - color1[1]))
    const b = Math.floor(color1[2] + ratio * (color2[2] - color1[2]))

    doc.setFillColor(r, g, b)
    doc.rect(x, y + i * stepHeight, width, stepHeight + 0.5, "F")
  }
}

// Función para dibujar un borde decorativo
function drawDecorationBorder(doc: jsPDF, x: number, y: number, width: number, height: number, color: number[]): void {
  const borderWidth = 2
  doc.setDrawColor(color[0], color[1], color[2])
  doc.setLineWidth(borderWidth)

  // Borde superior
  doc.line(x, y, x + width, y)

  // Borde derecho
  doc.line(x + width, y, x + width, y + height)

  // Borde inferior
  doc.line(x, y + height, x + width, y + height)

  // Borde izquierdo
  doc.line(x, y, x, y + height)

  // Esquinas decorativas
  const cornerSize = 5

  // Esquina superior izquierda
  doc.line(x, y + cornerSize, x + cornerSize, y)

  // Esquina superior derecha
  doc.line(x + width - cornerSize, y, x + width, y + cornerSize)

  // Esquina inferior derecha
  doc.line(x + width, y + height - cornerSize, x + width - cornerSize, y + height)

  // Esquina inferior izquierda
  doc.line(x, y + height - cornerSize, x + cornerSize, y + height)
}

// Función para añadir una marca de agua
function addWatermark(doc: jsPDF, text: string): void {
  const pageCount = doc.internal.pages.length - 1

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setTextColor(230, 230, 230)
    doc.setFontSize(60)
    doc.setFont("helvetica", "bold")

    // Obtener dimensiones de la página
    const pageHeight = doc.internal.pageSize.height
    const pageWidth = doc.internal.pageSize.width

    // Calcular el centro de la página
    const centerX = pageWidth / 2
    const centerY = pageHeight / 2

    // Dibujar la marca de agua sin rotación (más simple)
    doc.text(text, centerX, centerY, { align: "center" })
  }
}

// Función para crear un gráfico de barras mejorado
function drawEnhancedBarChart(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  data: { label: string; value: number; color: number[] }[],
  title: string,
  subtitle?: string,
  horizontal = false,
): void {
  // Calcular cuántos elementos pueden caber en una página
  const pageHeight = doc.internal.pageSize.height
  const availableHeight = pageHeight - y - 50 // Reservar espacio para encabezados y pies de página

  if (horizontal) {
    // Para gráficos horizontales, calculamos cuántas barras caben por página
    const barHeight = 8 // Altura de cada barra
    const barSpacing = 6 // Espacio entre barras
    const itemsPerPage = Math.floor(availableHeight / (barHeight + barSpacing))

    // Si hay más elementos que los que caben en una página, dividimos en múltiples páginas
    if (data.length > itemsPerPage && itemsPerPage > 0) {
      const totalPages = Math.ceil(data.length / itemsPerPage)

      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        // Si no es la primera página, añadimos una nueva
        if (pageNum > 0) {
          doc.addPage()
          // Añadir encabezado en la nueva página
          addPageHeader(doc, "ANÁLISIS POR CATEGORÍA", "Distribución de productos por categoría")

          // Reiniciar la posición Y para la nueva página
          y = 60
        }

        // Obtener los datos para esta página
        const startIdx = pageNum * itemsPerPage
        const endIdx = Math.min(startIdx + itemsPerPage, data.length)
        const pageData = data.slice(startIdx, endIdx)

        // Título de la página
        const pageTitle = pageNum === 0 ? title : `${title} (continuación ${pageNum + 1}/${totalPages})`

        // Dibujar el fondo del gráfico
        doc.setFillColor(250, 250, 250)
        doc.roundedRect(
          x - 5,
          y - 30,
          width + 10,
          Math.min(pageData.length * (barHeight + barSpacing) + 50, height + 50),
          5,
          5,
          "F",
        )

        // Dibujar borde
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.5)
        doc.roundedRect(
          x - 5,
          y - 30,
          width + 10,
          Math.min(pageData.length * (barHeight + barSpacing) + 50, height + 50),
          5,
          5,
          "S",
        )

        // Título del gráfico
        doc.setFont("helvetica", "bold")
        doc.setFontSize(14)
        doc.setTextColor(60, 60, 60)
        doc.text(pageTitle, x + width / 2, y - 15, { align: "center" })

        // Subtítulo si existe
        if (subtitle) {
          doc.setFont("helvetica", "normal")
          doc.setFontSize(10)
          doc.setTextColor(100, 100, 100)
          doc.text(subtitle, x + width / 2, y - 5, { align: "center" })
        }

        // Calcular la altura real para este conjunto de datos
        const graphHeight = Math.min(pageData.length * (barHeight + barSpacing), height)

        // Encontrar el valor máximo para esta página
        const maxValue = Math.max(...pageData.map((item) => item.value))

        // Dibujar líneas de cuadrícula verticales
        doc.setDrawColor(220, 220, 220)
        doc.setLineWidth(0.2)

        const gridLines = 5
        for (let i = 0; i <= gridLines; i++) {
          const xPos = x + (width / gridLines) * i
          doc.line(xPos, y, xPos, y + graphHeight)

          // Añadir etiquetas de valor en el eje X
          const value = Math.round((maxValue / gridLines) * i)
          doc.setFontSize(8)
          doc.setTextColor(100, 100, 100)
          doc.text(value.toString(), xPos, y + graphHeight + 10, { align: "center" })
        }

        // Dibujar eje Y
        doc.setDrawColor(150, 150, 150)
        doc.setLineWidth(0.5)
        doc.line(x, y, x, y + graphHeight)

        // Dibujar eje X
        doc.line(x, y + graphHeight, x + width, y + graphHeight)

        // Dibujar barras horizontales con efecto 3D
        for (let i = 0; i < pageData.length; i++) {
          const item = pageData[i]
          const barWidth = (item.value / maxValue) * width
          const barY = y + i * (barHeight + barSpacing) + barSpacing / 2

          // Sombra de la barra
          doc.setFillColor(220, 220, 220)
          doc.rect(x + 2, barY + 2, barWidth, barHeight, "F")

          // Barra principal
          doc.setFillColor(item.color[0], item.color[1], item.color[2])
          doc.rect(x, barY, barWidth, barHeight, "F")

          // Efecto de brillo en la barra
          doc.setFillColor(255, 255, 255, 0.3)
          doc.rect(x, barY, barWidth * 0.3, barHeight, "F")

          // Borde de la barra
          doc.setDrawColor(item.color[0] * 0.8, item.color[1] * 0.8, item.color[2] * 0.8)
          doc.setLineWidth(0.2)
          doc.rect(x, barY, barWidth, barHeight, "S")

          // Añadir valor al final de la barra
          doc.setFontSize(8)
          doc.setTextColor(50, 50, 50)
          doc.setFont("helvetica", "bold")
          doc.text(item.value.toString(), x + barWidth + 5, barY + barHeight / 2 + 3)

          // Añadir etiqueta a la izquierda de la barra
          doc.setFontSize(8)
          doc.setTextColor(80, 80, 80)
          doc.setFont("helvetica", "normal")

          // Truncar etiquetas largas
          let label = item.label
          if (label.length > 15) {
            label = label.substring(0, 13) + "..."
          }

          doc.text(label, x - 5, barY + barHeight / 2 + 3, { align: "right" })
        }

        // Añadir leyenda
        const legendY = y + graphHeight + 20
        doc.setFontSize(8)
        doc.setFont("helvetica", "italic")
        doc.setTextColor(100, 100, 100)
        doc.text("* Valores expresados en unidades", x, legendY)

        // Añadir información de paginación si hay múltiples páginas
        if (totalPages > 1) {
          doc.setFontSize(9)
          doc.setFont("helvetica", "normal")
          doc.setTextColor(100, 100, 100)
          doc.text(
            `Página ${pageNum + 1} de ${totalPages} - Categorías ${startIdx + 1} a ${endIdx} de ${data.length}`,
            x + width,
            legendY,
            { align: "right" },
          )
        }

        // Añadir pie de página
        const pageNumber = doc.internal.getNumberOfPages()
        addPageFooter(doc, pageNumber, pageNumber + totalPages - pageNum - 1)
      }

      return // Terminamos aquí para evitar ejecutar el código para gráficos de una sola página
    }
  }

  // El código original para gráficos que caben en una sola página
  // Dibujar fondo del gráfico
  doc.setFillColor(250, 250, 250)
  doc.roundedRect(x - 5, y - 30, width + 10, height + 50, 5, 5, "F")

  // Dibujar borde
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.roundedRect(x - 5, y - 30, width + 10, height + 50, 5, 5, "S")

  // Título del gráfico
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(60, 60, 60)
  doc.text(title, x + width / 2, y - 15, { align: "center" })

  // Subtítulo si existe
  if (subtitle) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(subtitle, x + width / 2, y - 5, { align: "center" })
  }

  const maxValue = Math.max(...data.map((item) => item.value))

  if (horizontal) {
    // Gráfico de barras horizontales
    const barHeight = 8 // Altura de cada barra (reducida)
    const barSpacing = 6 // Espacio entre barras (aumentado)

    // Dibujar líneas de cuadrícula verticales
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.2)

    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const xPos = x + (width / gridLines) * i
      doc.line(xPos, y, xPos, y + height)

      // Añadir etiquetas de valor en el eje X
      const value = Math.round((maxValue / gridLines) * i)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(value.toString(), xPos, y + height + 10, { align: "center" })
    }

    // Dibujar eje Y
    doc.setDrawColor(150, 150, 150)
    doc.setLineWidth(0.5)
    doc.line(x, y, x, y + height)

    // Dibujar eje X
    doc.line(x, y + height, x + width, y + height)

    // Dibujar barras horizontales con efecto 3D
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      const barWidth = (item.value / maxValue) * width
      const barY = y + i * (barHeight + barSpacing) + barSpacing / 2

      // Sombra de la barra
      doc.setFillColor(220, 220, 220)
      doc.rect(x + 2, barY + 2, barWidth, barHeight, "F")

      // Barra principal
      doc.setFillColor(item.color[0], item.color[1], item.color[2])
      doc.rect(x, barY, barWidth, barHeight, "F")

      // Efecto de brillo en la barra
      doc.setFillColor(255, 255, 255, 0.3)
      doc.rect(x, barY, barWidth * 0.3, barHeight, "F")

      // Borde de la barra
      doc.setDrawColor(item.color[0] * 0.8, item.color[1] * 0.8, item.color[2] * 0.8)
      doc.setLineWidth(0.2)
      doc.rect(x, barY, barWidth, barHeight, "S")

      // Añadir valor al final de la barra
      doc.setFontSize(8)
      doc.setTextColor(50, 50, 50)
      doc.setFont("helvetica", "bold")
      doc.text(item.value.toString(), x + barWidth + 5, barY + barHeight / 2 + 3)

      // Añadir etiqueta a la izquierda de la barra
      doc.setFontSize(8)
      doc.setTextColor(80, 80, 80)
      doc.setFont("helvetica", "normal")

      // Truncar etiquetas largas
      let label = item.label
      if (label.length > 15) {
        label = label.substring(0, 13) + "..."
      }

      doc.text(label, x - 5, barY + barHeight / 2 + 3, { align: "right" })
    }
  } else {
    // Gráfico de barras verticales (código original)
    const barWidth = (width / data.length) * 0.7
    const spacing = (width / data.length) * 0.3

    // Dibujar líneas de cuadrícula horizontales
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.2)

    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const yPos = y + height - (height / gridLines) * i
      doc.line(x, yPos, x + width, yPos)

      // Añadir etiquetas de valor en el eje Y
      const value = Math.round((maxValue / gridLines) * i)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(value.toString(), x - 5, yPos, { align: "right" })
    }

    // Dibujar eje X
    doc.setDrawColor(150, 150, 150)
    doc.setLineWidth(0.5)
    doc.line(x, y + height, x + width, y + height)

    // Dibujar eje Y
    doc.line(x, y, x, y + height)

    // Dibujar barras con efecto 3D
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      const barHeight = (item.value / maxValue) * height
      const barX = x + i * (barWidth + spacing) + spacing / 2
      const barY = y + height - barHeight

      // Sombra de la barra
      doc.setFillColor(220, 220, 220)
      doc.rect(barX + 2, barY + 2, barWidth, barHeight, "F")

      // Barra principal
      doc.setFillColor(item.color[0], item.color[1], item.color[2])
      doc.rect(barX, barY, barWidth, barHeight, "F")

      // Efecto de brillo en la barra
      doc.setFillColor(255, 255, 255, 0.3)
      doc.rect(barX, barY, barWidth * 0.3, barHeight, "F")

      // Borde de la barra
      doc.setDrawColor(item.color[0] * 0.8, item.color[1] * 0.8, item.color[2] * 0.8)
      doc.setLineWidth(0.2)
      doc.rect(barX, barY, barWidth, barHeight, "S")

      // Añadir valor sobre la barra
      doc.setFontSize(8)
      doc.setTextColor(50, 50, 50)
      doc.setFont("helvetica", "bold")
      doc.text(item.value.toString(), barX + barWidth / 2, barY - 2, { align: "center" })

      // Añadir etiqueta debajo de la barra
      doc.setFontSize(7)
      doc.setTextColor(80, 80, 80)
      doc.setFont("helvetica", "normal")

      // Truncar etiquetas largas
      let label = item.label
      if (label.length > 10) {
        label = label.substring(0, 8) + "..."
      }

      doc.text(label, barX + barWidth / 2, y + height + 10, { align: "center" })
    }
  }

  // Añadir leyenda
  const legendY = y + height + 20
  doc.setFontSize(8)
  doc.setFont("helvetica", "italic")
  doc.setTextColor(100, 100, 100)
  doc.text("* Valores expresados en unidades", x, legendY)
}

// Función para crear un gráfico circular mejorado
function drawEnhancedPieChart(
  doc: jsPDF,
  x: number,
  y: number,
  radius: number,
  data: { label: string; value: number; color: number[] }[],
  title: string,
): void {
  // Dibujar fondo del gráfico
  doc.setFillColor(250, 250, 250)
  doc.roundedRect(x - radius - 10, y - radius - 30, radius * 2 + 20, radius * 2 + 90, 5, 5, "F")

  // Dibujar borde
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.roundedRect(x - radius - 10, y - radius - 30, radius * 2 + 20, radius * 2 + 90, 5, 5, "S")

  // Título del gráfico
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(60, 60, 60)
  doc.text(title, x, y - radius - 15, { align: "center" })

  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Dibujar círculo base (fondo)
  doc.setFillColor(240, 240, 240)
  doc.circle(x, y, radius, "F")

  // Dibujar sectores
  let startAngle = 0
  const sectors: {
    label: string
    percentage: number
    color: number[]
    startAngle: number
    endAngle: number
    value: number
  }[] = []

  // Primero calculamos todos los ángulos
  for (const item of data) {
    const portion = item.value / total
    const angle = portion * 2 * Math.PI
    const endAngle = startAngle + angle

    sectors.push({
      label: item.label,
      percentage: portion * 100,
      color: item.color,
      startAngle,
      endAngle,
      value: item.value,
    })

    startAngle = endAngle
  }

  // Luego dibujamos los sectores (no podemos usar arc, así que simulamos con muchos triángulos)
  for (const sector of sectors) {
    const steps = 36 // Número de triángulos para aproximar el sector
    const angleStep = (sector.endAngle - sector.startAngle) / steps

    doc.setFillColor(sector.color[0], sector.color[1], sector.color[2])

    for (let i = 0; i < steps; i++) {
      const angle1 = sector.startAngle + i * angleStep
      const angle2 = sector.startAngle + (i + 1) * angleStep

      const x1 = x + Math.cos(angle1) * radius
      const y1 = y + Math.sin(angle1) * radius
      const x2 = x + Math.cos(angle2) * radius
      const y2 = y + Math.sin(angle2) * radius

      // Dibujar un triángulo desde el centro hasta los dos puntos del arco
      doc.triangle(x, y, x1, y1, x2, y2, "F")
    }

    // Añadir un borde al sector
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0.5)

    for (let i = 0; i < steps; i++) {
      const angle = sector.startAngle + i * angleStep
      const x1 = x + Math.cos(angle) * radius
      const y1 = y + Math.sin(angle) * radius
      const x2 = x + Math.cos(angle + angleStep) * radius
      const y2 = y + Math.sin(angle + angleStep) * radius

      doc.line(x1, y1, x2, y2)
    }

    // Añadir etiquetas dentro del gráfico para sectores grandes (>10%)
    if (sector.percentage > 10) {
      const midAngle = sector.startAngle + (sector.endAngle - sector.startAngle) / 2
      const labelRadius = radius * 0.7
      const labelX = x + Math.cos(midAngle) * labelRadius
      const labelY = y + Math.sin(midAngle) * labelRadius

      doc.setFillColor(255, 255, 255)
      doc.circle(labelX, labelY, 8, "F")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(7)
      doc.setTextColor(50, 50, 50)
      doc.text(`${Math.round(sector.percentage)}%`, labelX, labelY + 2, { align: "center" })
    }
  }

  // Dibujar borde del círculo
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.circle(x, y, radius, "S")

  // Añadir leyenda con más detalles
  const legendStartY = y + radius + 10
  const legendItemHeight = 15

  for (let i = 0; i < sectors.length; i++) {
    const sector = sectors[i]
    const legendY = legendStartY + i * legendItemHeight

    // Cuadrado de color
    doc.setFillColor(sector.color[0], sector.color[1], sector.color[2])
    doc.rect(x - radius, legendY, 8, 8, "F")

    // Borde del cuadrado
    doc.setDrawColor(150, 150, 150)
    doc.setLineWidth(0.2)
    doc.rect(x - radius, legendY, 8, 8, "S")

    // Texto de la leyenda con más detalles
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(60, 60, 60)

    // Truncar etiquetas largas
    let label = sector.label
    if (label.length > 15) {
      label = label.substring(0, 13) + "..."
    }

    doc.text(`${label} (${sector.percentage.toFixed(1)}% - ${sector.value} product.)`, x - radius + 12, legendY + 6)
  }
}

// Función para crear una tarjeta de estadísticas mejorada
function drawEnhancedStatsCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  value: string,
  icon: string,
  color: number[],
  trend?: { value: number; isPositive: boolean },
): void {
  // Dibujar sombra
  doc.setFillColor(220, 220, 220)
  doc.roundedRect(x + 2, y + 2, width, height, 5, 5, "F")

  // Dibujar fondo de la tarjeta
  doc.setFillColor(250, 250, 250)
  doc.roundedRect(x, y, width, height, 5, 5, "F")

  // Dibujar borde
  doc.setDrawColor(230, 230, 230)
  doc.setLineWidth(0.5)
  doc.roundedRect(x, y, width, height, 5, 5, "S")

  // Dibujar indicador de color en la parte superior
  doc.setFillColor(color[0], color[1], color[2])
  // Primero dibujamos el rectángulo con relleno
  doc.rect(x, y, width, 8, "F")
  // Luego dibujamos solo los bordes redondeados para simular un rectángulo redondeado
  doc.setDrawColor(color[0], color[1], color[2])
  doc.roundedRect(x, y, width, 8, 5, 5)

  // Título de la tarjeta
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  doc.text(title, x + 10, y + 20)

  // Valor principal
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.setTextColor(50, 50, 50)
  doc.text(value, x + 10, y + 35)

  // Icono (simulado con texto)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(14)
  doc.setTextColor(color[0], color[1], color[2])
  doc.text(icon, x + width - 15, y + 25)

  // Tendencia si existe
  if (trend) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)

    if (trend.isPositive) {
      doc.setTextColor(0, 150, 0)
      doc.text(`↑ ${trend.value}%`, x + 10, y + 45)
    } else {
      doc.setTextColor(200, 0, 0)
      doc.text(`↓ ${trend.value}%`, x + 10, y + 45)
    }
  }
}

// Función para añadir un encabezado de página
function addPageHeader(doc: jsPDF, title: string, subtitle?: string): void {
  const pageWidth = doc.internal.pageSize.width
  const margin = 15

  // Fondo del encabezado
  doc.setFillColor(0, 102, 0)
  doc.rect(0, 0, pageWidth, 25, "F")

  // Añadir el logo
  try {
    const logoWidth = 50
    const logoHeight = 18
    doc.addImage("/farmacias-brasil-logo.jpg", "JPG", margin, 4, logoWidth, logoHeight)
  } catch (error) {
    console.error("Error al añadir el logo al PDF:", error)
  }

  // Título en el encabezado
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text(title, pageWidth - margin, 15, { align: "right" })

  // Subtítulo si existe
  if (subtitle) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(240, 240, 240)
    doc.text(subtitle, pageWidth - margin, 22, { align: "right" })
  }
}

// Función para añadir un pie de página
function addPageFooter(doc: jsPDF, pageNumber: number, totalPages: number): void {
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 15

  // Línea separadora
  doc.setDrawColor(0, 102, 0)
  doc.setLineWidth(0.5)
  doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)

  // Información de página
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" })

  // Fecha de generación
  doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`, margin, pageHeight - 10)

  // Texto central
  doc.text("© Farmacias Brasil - Sistema de Gestión de Inventario", pageWidth / 2, pageHeight - 10, {
    align: "center",
  })
}

// Función para crear un gráfico circular simple
function drawPieChart(
  doc: jsPDF,
  x: number,
  y: number,
  radius: number,
  data: { value: number; color: number[] }[],
): void {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let startAngle = 0

  for (const item of data) {
    const portion = item.value / total
    const endAngle = startAngle + portion * 2 * Math.PI

    doc.setFillColor(item.color[0], item.color[1], item.color[2])

    // Dibujar sector circular usando ellipse en lugar de arc
    doc.saveGraphicsState()
    // Usamos ellipse con los mismos radios para crear un círculo
    doc.ellipse(x, y, radius, radius, "F")
    doc.restoreGraphicsState()

    startAngle = endAngle
  }
}

// Función para crear un gráfico de barras simple
function drawBarChart(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  data: { label: string; value: number; color: number[] }[],
): void {
  const maxValue = Math.max(...data.map((item) => item.value))
  const barWidth = (width / data.length) * 0.8
  const spacing = (width / data.length) * 0.2

  // Dibujar eje X
  doc.setDrawColor(100, 100, 100)
  doc.setLineWidth(0.5)
  doc.line(x, y + height, x + width, y + height)

  // Dibujar eje Y
  doc.line(x, y, x, y + height)

  // Dibujar barras
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    const barHeight = (item.value / maxValue) * height
    const barX = x + i * (barWidth + spacing) + spacing / 2
    const barY = y + height - barHeight

    // Dibujar barra
    doc.setFillColor(item.color[0], item.color[1], item.color[2])
    doc.rect(barX, barY, barWidth, barHeight, "F")

    // Añadir etiqueta
    doc.setFontSize(8)
    doc.setTextColor(50, 50, 50)
    doc.text(item.label, barX + barWidth / 2, y + height + 5, { align: "center" })

    // Añadir valor
    doc.text(item.value.toString(), barX + barWidth / 2, barY - 2, { align: "center" })
  }
}

// Función para exportar inventario a PDF con diseño mejorado
export function exportInventoryToPDF(products: Product[]): void {
  console.log(`Generando PDF para ${products.length} productos`)

  // Crear documento PDF
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Obtener dimensiones de la página
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 15

  // ===== PÁGINA DE PORTADA =====

  // Fondo con degradado
  addGradientBackground(doc, 0, 0, pageWidth, pageHeight, [255, 255, 255], [240, 248, 255])

  // Borde decorativo
  drawDecorationBorder(doc, margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, [0, 102, 0])

  // Añadir el logo
  try {
    const logoWidth = 100
    const logoHeight = 40
    doc.addImage("/farmacias-brasil-logo.jpg", "JPG", (pageWidth - logoWidth) / 2, 50, logoWidth, logoHeight)
  } catch (error) {
    console.error("Error al añadir el logo al PDF:", error)
  }

  // Título principal
  doc.setFont("helvetica", "bold")
  doc.setFontSize(28)
  doc.setTextColor(0, 102, 0)
  doc.text("REPORTE DE INVENTARIO", pageWidth / 2, 120, { align: "center" })

  // Subtítulo
  doc.setFont("helvetica", "normal")
  doc.setFontSize(16)
  doc.setTextColor(80, 80, 80)
  doc.text("Información completa del inventario", pageWidth / 2, 135, { align: "center" })

  // Fecha y hora
  doc.setFontSize(12)
  doc.text(`Generado: ${format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}`, pageWidth / 2, 150, {
    align: "center",
  })

  // Imagen decorativa
  try {
    const imageWidth = 120
    const imageHeight = 80
    doc.addImage("/pharmacy-inventory-shelves.png", "SVG", (pageWidth - imageWidth) / 2, 170, imageWidth, imageHeight)
  } catch (error) {
    console.error("Error al añadir la imagen decorativa:", error)
  }

  // Información adicional
  doc.setFont("helvetica", "italic")
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text("Documento confidencial para uso interno", pageWidth / 2, pageHeight - 30, { align: "center" })

  // ===== PÁGINA DE ESTADÍSTICAS =====
  doc.addPage()

  // Añadir encabezado
  addPageHeader(doc, "ESTADÍSTICAS DE INVENTARIO", "Resumen general")

  // Calcular estadísticas
  const totalProducts = products.length
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0)
  const totalValue = products.reduce((sum, product) => sum + (product.costPrice || 0) * product.stock, 0)
  const lowStockProducts = products.filter((p) => p.reorderLevel && p.stock <= p.reorderLevel).length
  const avgPrice = totalProducts > 0 ? totalValue / totalStock : 0

  // Título de la sección
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(0, 102, 0)
  doc.text("Indicadores Clave de Inventario", pageWidth / 2, 40, { align: "center" })

  // Línea decorativa
  doc.setDrawColor(0, 102, 0)
  doc.setLineWidth(1)
  doc.line(margin, 45, pageWidth - margin, 45)

  // Crear tarjetas de estadísticas mejoradas
  const cardWidth = (pageWidth - 3 * margin) / 2
  const cardHeight = 50

  // Tarjeta 1: Total de productos
  drawEnhancedStatsCard(
    doc,
    margin,
    55,
    cardWidth,
    cardHeight,
    "Total de Productos",
    totalProducts.toString(),
    "",
    [0, 102, 0],
  )

  // Tarjeta 2: Valor del inventario
  drawEnhancedStatsCard(
    doc,
    2 * margin + cardWidth,
    55,
    cardWidth,
    cardHeight,
    "Valor del Inventario",
    `$${totalValue.toFixed(2)}`,
    "",
    [0, 128, 128],
  )

  // Tarjeta 3: Total de unidades
  drawEnhancedStatsCard(
    doc,
    margin,
    55 + cardHeight + 10,
    cardWidth,
    cardHeight,
    "Total de Unidades",
    totalStock.toString(),
    "",
    [70, 130, 180],
  )

  // Tarjeta 4: Productos con stock bajo
  drawEnhancedStatsCard(
    doc,
    2 * margin + cardWidth,
    55 + cardHeight + 10,
    cardWidth,
    cardHeight,
    "Productos con Stock Bajo",
    lowStockProducts.toString(),
    "",
    lowStockProducts > 0 ? [200, 0, 0] : [0, 102, 0],
  )

  // Tarjeta 5: Precio promedio
  drawEnhancedStatsCard(
    doc,
    margin,
    55 + (cardHeight + 10) * 2,
    cardWidth,
    cardHeight,
    "Precio Promedio",
    `$${avgPrice.toFixed(2)}`,
    "",
    [100, 100, 200],
  )

  // Tarjeta 6: Categorías
  // Ensure we count all categories correctly, including null/undefined as "Sin categoría"
  const categoriesSet = new Set()
  products.forEach((p) => {
    categoriesSet.add(p.category || "Sin categoría")
  })
  const uniqueCategories = categoriesSet.size
  drawEnhancedStatsCard(
    doc,
    2 * margin + cardWidth,
    55 + (cardHeight + 10) * 2,
    cardWidth,
    cardHeight,
    "Categorías",
    uniqueCategories.toString(),
    "",
    [150, 75, 150],
  )

  // Añadir pie de página
  addPageFooter(doc, 2, 5) // Página 2 de 5 (ahora son 5 páginas en total)

  // ===== PÁGINA DE GRÁFICO DE CATEGORÍAS =====
  doc.addPage()

  // Añadir encabezado
  addPageHeader(doc, "ANÁLISIS POR CATEGORÍA", "Distribución de productos por categoría")

  // Título de la sección
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(0, 102, 0)
  doc.text("Distribución de Productos por Categoría", pageWidth / 2, 40, { align: "center" })

  // Línea decorativa
  doc.setDrawColor(0, 102, 0)
  doc.setLineWidth(1)
  doc.line(margin, 45, pageWidth - margin, 45)

  // Preparar datos para gráficos

  // 1. Distribución por categoría
  const categories: Record<string, number> = {}
  products.forEach((product) => {
    const category = product.category || "Sin categoría"
    categories[category] = (categories[category] || 0) + 1
  })

  // Convertir a array para el gráfico y ordenar por valor
  const categoryData = Object.entries(categories)
    .map(([label, value], index) => {
      // Colores predefinidos para las categorías
      const colors = [
        [0, 102, 0], // Verde oscuro
        [46, 139, 87], // Verde mar
        [60, 179, 113], // Verde medio
        [144, 238, 144], // Verde claro
        [152, 251, 152], // Verde pálido
        [0, 128, 0], // Verde
        [34, 139, 34], // Verde bosque
        [50, 205, 50], // Verde lima
        [124, 252, 0], // Verde amarillento
        [173, 255, 47], // Verde amarillo
        [107, 142, 35], // Verde oliva
        [85, 107, 47], // Verde oliva oscuro
        [143, 188, 143], // Verde mar claro
        [102, 205, 170], // Verde mar medio
      ]
      return {
        label,
        value,
        color: colors[index % colors.length],
      }
    })
    .sort((a, b) => b.value - a.value)
  // Ya no limitamos a 6 categorías

  // Calcular altura necesaria para el gráfico basado en el número de categorías
  const barHeight = 8 // Altura de cada barra (reducida de 12 a 8)
  const barSpacing = 6 // Espacio entre barras (aumentado de 5 a 6)
  const totalCategoriesHeight = categoryData.length * (barHeight + barSpacing)

  // Ajustar la altura del gráfico según el número de categorías, con un máximo
  const graphHeight = Math.min(totalCategoriesHeight, 200) // Aumentado de 180 a 200 para dar más espacio

  // Dibujar gráfico de barras mejorado para categorías (ahora horizontal)
  drawEnhancedBarChart(
    doc,
    margin + 35, // Aumentado de 30 a 35 para dar más espacio a las etiquetas
    55, // Reducido de 60 a 55 para comenzar un poco más arriba
    pageWidth - 2 * margin - 45, // Aumentado de 40 a 45 para dejar más espacio para etiquetas
    graphHeight,
    categoryData,
    "Distribución por Categoría",
    "Número de productos por categoría",
    true, // Usar barras horizontales
  )

  // Añadir pie de página
  // El pie de página se maneja dentro de drawEnhancedBarChart cuando hay paginación

  // ===== PÁGINA DE GRÁFICO DE NIVELES DE STOCK =====
  doc.addPage()

  // Añadir encabezado
  addPageHeader(doc, "ANÁLISIS DE STOCK", "Distribución por nivel de stock")

  // Título de la sección
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(0, 102, 0)
  doc.text("Distribución por Nivel de Stock", pageWidth / 2, 40, { align: "center" })

  // Línea decorativa
  doc.setDrawColor(0, 102, 0)
  doc.setLineWidth(1)
  doc.line(margin, 45, pageWidth - margin, 45)

  // 2. Distribución por nivel de stock
  const stockLevels = {
    "Stock Crítico": products.filter((p) => p.reorderLevel && p.stock <= p.reorderLevel * 0.5).length,
    "Stock Bajo": products.filter((p) => p.reorderLevel && p.stock > p.reorderLevel * 0.5 && p.stock <= p.reorderLevel)
      .length,
    "Stock Normal": products.filter(
      (p) => !p.reorderLevel || (p.stock > p.reorderLevel && p.stock <= p.reorderLevel * 2),
    ).length,
    "Stock Alto": products.filter((p) => p.reorderLevel && p.stock > p.reorderLevel * 2).length,
  }

  const stockData = [
    { label: "Stock Crítico", value: stockLevels["Stock Crítico"], color: [200, 0, 0] },
    { label: "Stock Bajo", value: stockLevels["Stock Bajo"], color: [255, 165, 0] },
    { label: "Stock Normal", value: stockLevels["Stock Normal"], color: [0, 128, 0] },
    { label: "Stock Alto", value: stockLevels["Stock Alto"], color: [0, 0, 255] },
  ]

  // Dibujar gráfico circular para niveles de stock (centrado en la página)
  drawEnhancedPieChart(doc, pageWidth / 2, 120, 60, stockData, "Distribución por Nivel de Stock")

  // Añadir pie de página
  addPageFooter(doc, 4, 5) // Página 4 de 5

  // ===== PÁGINA DE TABLA DE INVENTARIO =====
  doc.addPage()

  // Añadir encabezado
  addPageHeader(doc, "DETALLE DE INVENTARIO", "Listado completo de productos")

  // Preparar datos para la tabla
  const tableColumn = ["ID", "Producto", "SKU", "Categoría", "Stock", "Nivel Reorden", "Precio", "Ubicación"]

  const tableRows = products.map((product) => {
    // Determinar si el producto tiene stock bajo
    const isLowStock = product.reorderLevel && product.stock <= product.reorderLevel

    return [
      product.id.toString(),
      product.name,
      product.sku || "N/A",
      product.category || "Sin categoría",
      {
        content: product.stock.toString(),
        styles: isLowStock ? { textColor: [204, 0, 0], fontStyle: "bold" } : {},
      },
      product.reorderLevel?.toString() || "N/A",
      `$${product.price.toFixed(2)}`,
      product.location || "N/A",
    ]
  })

  // Generar la tabla con estilo mejorado
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    theme: "grid",
    headStyles: {
      fillColor: [0, 102, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      lineColor: [200, 200, 200],
    },
    columnStyles: {
      0: { cellWidth: 15 }, // ID
      1: { cellWidth: 40 }, // Producto
      2: { cellWidth: 25 }, // SKU
      3: { cellWidth: 25 }, // Categoría
      4: { cellWidth: 15, halign: "center" }, // Stock
      5: { cellWidth: 20, halign: "center" }, // Nivel Reorden
      6: { cellWidth: 20, halign: "right" }, // Precio
      7: { cellWidth: 25 }, // Ubicación
    },
    alternateRowStyles: { fillColor: [245, 250, 245] },
    // Añadir paginación para tablas grandes
    didDrawPage: (data: any) => {
      // Añadir encabezado en cada página
      if (data.pageNumber > 1) {
        addPageHeader(doc, "DETALLE DE INVENTARIO", "Listado completo de productos")
      }

      // Añadir pie de página
      const pageNumber = doc.internal.pages.length - 1
      addPageFooter(doc, data.pageNumber, pageNumber)
    },
  })

  // Añadir leyenda para productos con stock bajo
  const finalY = (doc as any).lastAutoTable.finalY || 150
  doc.setFont("helvetica", "italic")
  doc.setFontSize(9)
  doc.setTextColor(204, 0, 0)
  doc.text("* Los productos en rojo tienen un nivel de stock por debajo del nivel de reorden", margin, finalY + 10)

  // Guardar el PDF
  doc.save(`inventario_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`)
}

// Función para exportar inventario a CSV
export function exportInventoryToCSV(products: Product[]): void {
  console.log(`Exportando a CSV: ${products.length} productos`)
  // Encabezados CSV
  const headers = [
    "ID",
    "Producto",
    "SKU",
    "Código de Barras",
    "Categoría",
    "Descripción",
    "Stock",
    "Nivel de Reorden",
    "Precio",
    "Costo",
    "Proveedor",
    "Fecha de Expiración",
    "Ubicación",
    "Estado",
  ]

  // Convertir datos a filas CSV
  const rows = products.map((product) => {
    return [
      product.id,
      product.name.replace(/,/g, " "), // Evitar problemas con comas en nombres
      product.sku || "",
      product.barcode || "",
      product.category || "",
      (product.description || "").replace(/,/g, " "),
      product.stock,
      product.reorderLevel || "",
      product.price.toFixed(2),
      product.costPrice || "",
      product.supplier || "",
      product.expiryDate || "",
      product.location || "",
      product.status || "",
    ].join(",")
  })

  // Combinar encabezados y filas
  const csvContent = [headers.join(","), ...rows].join("\n")

  // Añadir BOM (Byte Order Mark) para UTF-8
  const BOM = "\uFEFF"
  const csvContentWithBOM = BOM + csvContent

  // Crear blob y descargar
  const blob = new Blob([csvContentWithBOM], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `inventario_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Función para exportar inventario a Excel (usando CSV como alternativa simple)
export function exportInventoryToExcel(products: Product[]): void {
  console.log(`Exportando a Excel: ${products.length} productos`)
  // En un entorno real, usaríamos una biblioteca como ExcelJS
  // Para simplificar, usaremos el mismo enfoque CSV pero con extensión .xlsx

  // Encabezados
  const headers = [
    "ID",
    "Producto",
    "SKU",
    "Código de Barras",
    "Categoría",
    "Descripción",
    "Stock",
    "Nivel de Reorden",
    "Precio",
    "Costo",
    "Proveedor",
    "Fecha de Expiración",
    "Ubicación",
    "Estado",
  ]

  // Convertir datos a filas
  const rows = products.map((product) => {
    return [
      product.id,
      product.name.replace(/,/g, " "), // Evitar problemas con comas en nombres
      product.sku || "",
      product.barcode || "",
      product.category || "",
      (product.description || "").replace(/,/g, " "),
      product.stock,
      product.reorderLevel || "",
      product.price.toFixed(2),
      product.costPrice || "",
      product.supplier || "",
      product.expiryDate || "",
      product.location || "",
      product.status || "",
    ].join(",")
  })

  // Combinar encabezados y filas
  const csvContent = [headers.join(","), ...rows].join("\n")

  // Añadir BOM (Byte Order Mark) para UTF-8
  const BOM = "\uFEFF"
  const csvContentWithBOM = BOM + csvContent

  // Crear blob y descargar
  const blob = new Blob([csvContentWithBOM], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `inventario_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

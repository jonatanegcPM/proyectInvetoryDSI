import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { SupplierOrder } from "@/types/suppliers"

// Colores de la empresa
const COLORS = {
  primary: "#2E7D32", // Verde oscuro
  secondary: "#4CAF50", // Verde claro
  accent: "#8BC34A", // Verde lima
  text: "#333333", // Texto oscuro
  lightText: "#666666", // Texto claro
  background: "#FFFFFF", // Fondo blanco
}

/**
 * Genera un PDF elegante con los datos de pedidos
 * @param orders Lista de pedidos a incluir en el PDF
 * @returns Blob con el PDF generado
 */
export async function generateOrdersPDF(orders: SupplierOrder[]): Promise<Blob> {
  // Crear un nuevo documento PDF con orientación horizontal para más espacio
  const doc = new jsPDF({
    orientation: "landscape", // Orientación horizontal para más espacio
    unit: "mm",
    format: "a4",
  })

  // Añadir metadatos al documento
  doc.setProperties({
    title: "Listado de Pedidos - Farmacias Brasil",
    subject: "Reporte de pedidos",
    author: "Sistema de Gestión Farmacias Brasil",
    keywords: "pedidos, proveedores, farmacias, brasil, reporte",
    creator: "Farmacias Brasil",
  })

  // Configurar fuentes
  doc.setFont("helvetica", "normal")

  // Añadir encabezado con logo y título
  await addHeader(doc)

  // Añadir título del reporte
  doc.setFontSize(18)
  doc.setTextColor(COLORS.primary)
  doc.text("Listado de Pedidos", 148, 30, { align: "center" }) // Ajustado para orientación horizontal

  // Añadir fecha del reporte
  doc.setFontSize(10)
  doc.setTextColor(COLORS.lightText)
  const today = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  doc.text(`Generado el ${today}`, 148, 36, { align: "center" }) // Ajustado para orientación horizontal

  // Añadir tabla de pedidos
  addOrdersTable(doc, orders)

  // Añadir página con detalles de productos para cada pedido
  if (orders.some((order) => order.orderItems && order.orderItems.length > 0)) {
    await addOrderDetailsPages(doc, orders)
  }

  // Añadir pie de página
  addFooter(doc)

  // Convertir el documento a Blob
  const pdfBlob = doc.output("blob")
  return pdfBlob
}

/**
 * Añade el encabezado al documento PDF
 * @param doc Documento PDF
 */
async function addHeader(doc: jsPDF): Promise<void> {
  const pageWidth = doc.internal.pageSize.width // Obtener ancho de página para adaptarse a orientación

  // Añadir rectángulo de color en la parte superior
  doc.setFillColor(COLORS.primary)
  doc.rect(0, 0, pageWidth, 20, "F")

  // Añadir logo de la empresa
  try {
    // En una implementación real, cargaríamos el logo desde una URL o archivo
    // Para este ejemplo, usamos una imagen base64 o una URL
    const logoUrl = "/images/farmacias-brasil-logo-green.png"
    const img = new Image()
    img.src = logoUrl

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        // Calcular dimensiones para mantener la proporción
        const aspectRatio = img.width / img.height
        const height = 15
        const width = height * aspectRatio

        // Añadir la imagen al PDF
        doc.addImage(img, "PNG", 10, 2.5, width, height)
        resolve()
      }
      img.onerror = () => {
        // Si hay error al cargar la imagen, simplemente continuamos sin ella
        console.error("Error al cargar el logo")
        resolve()
      }
    })
  } catch (error) {
    console.error("Error al añadir el logo:", error)
  }

  // Añadir título de la empresa
  doc.setFontSize(16)
  doc.setTextColor(COLORS.background)
  doc.setFont("helvetica", "bold")
  doc.text("FARMACIAS BRASIL", 148, 12, { align: "center" }) // Ajustado para orientación horizontal
}

/**
 * Añade la tabla de pedidos al documento PDF
 * @param doc Documento PDF
 * @param orders Lista de pedidos
 */
function addOrdersTable(doc: jsPDF, orders: SupplierOrder[]): void {
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const tableWidth = pageWidth - 20 // 10mm de margen a cada lado

  // Calcular el espacio para el pie de página (15mm desde el borde inferior)
  const footerHeight = 15

  // Formatear los datos para la tabla
  const tableData = orders.map((order) => [
    order.id,
    formatOrderDate(order.date),
    order.expectedDate ? formatOrderDate(order.expectedDate) : "N/A",
    order.supplierName || "",
    order.items.toString(),
    formatCurrency(order.total),
    getStatusLabel(order.status),
  ])

  // Configurar la tabla
  autoTable(doc, {
    head: [["ID", "Fecha", "Fecha Esperada", "Proveedor", "Productos", "Total", "Estado"]],
    body: tableData,
    startY: 45,
    theme: "grid",
    styles: {
      fontSize: 8, // Tamaño de fuente pequeño pero legible
      cellPadding: 2, // Padding reducido para optimizar espacio
      lineColor: [200, 200, 200],
      overflow: "linebreak", // Permitir que el texto salte a la siguiente línea
      cellWidth: "wrap", // Permitir que el texto se envuelva
      minCellHeight: 5, // Altura mínima para celdas
    },
    headStyles: {
      fillColor: [COLORS.primary.replace("#", "")],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    // Definir anchos de columna proporcionales al espacio disponible
    columnStyles: {
      0: { cellWidth: tableWidth * 0.15 }, // ID (15%)
      1: { cellWidth: tableWidth * 0.12 }, // Fecha (12%)
      2: { cellWidth: tableWidth * 0.12 }, // Fecha Esperada (12%)
      3: { cellWidth: tableWidth * 0.25 }, // Proveedor (25%)
      4: { cellWidth: tableWidth * 0.08 }, // Productos (8%)
      5: { cellWidth: tableWidth * 0.13 }, // Total (13%)
      6: { cellWidth: tableWidth * 0.15 }, // Estado (15%)
    },
    // Establecer márgenes explícitos, incluyendo un margen inferior para el pie de página
    margin: {
      left: 10,
      right: 10,
      bottom: footerHeight, // Margen inferior para el pie de página
    },
    // Manejar el salto de página y dibujar el pie de página en cada página
    didDrawPage: (data) => {
      // Añadir pie de página en cada página
      addFooter(doc)
    },
    // Verificar si la tabla está cerca del pie de página y forzar un salto si es necesario
    didParseCell: (data) => {
      // Si estamos en la última fila y cerca del pie de página, forzar un salto
      const rowHeight = data.row.height
      if (!data.cursor) return
      const currentY = data.cursor.y

      // Si la celda actual está demasiado cerca del pie de página, forzar un salto
      if (currentY + rowHeight > pageHeight - footerHeight) {
        data.cursor.y = 0 // Esto forzará un salto de página
      }
    },
  })
}

/**
 * Añade páginas con detalles de productos para cada pedido
 * @param doc Documento PDF
 * @param orders Lista de pedidos
 */
async function addOrderDetailsPages(doc: jsPDF, orders: SupplierOrder[]): Promise<void> {
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const footerHeight = 15

  // Filtrar solo pedidos con productos
  const ordersWithItems = orders.filter((order) => order.orderItems && order.orderItems.length > 0)

  if (ordersWithItems.length === 0) return

  // Añadir nueva página para los detalles
  doc.addPage()

  // Añadir encabezado a la nueva página
  await addHeader(doc)

  // Título de la sección de detalles
  doc.setFontSize(14)
  doc.setTextColor(COLORS.primary)
  doc.text("Detalle de Productos por Pedido", 148, 30, { align: "center" })

  // Posición Y inicial
  let yPos = 40

  // Para cada pedido mostrar los productos
  for (const order of ordersWithItems) {
    // Si no hay espacio suficiente para este pedido y sus productos, añadir nueva página
    if (yPos > pageHeight - footerHeight - 60) {
      doc.addPage()
      await addHeader(doc)
      yPos = 40
    }

    // Encabezado del pedido
    doc.setFillColor(COLORS.secondary)
    doc.setDrawColor(COLORS.primary)
    doc.setTextColor(COLORS.background)
    doc.roundedRect(10, yPos, pageWidth - 20, 10, 1, 1, "FD")

    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text(
      `Pedido: ${order.id} - Proveedor: ${order.supplierName || "Sin especificar"} - Fecha: ${formatOrderDate(order.date)}`,
      pageWidth / 2,
      yPos + 6,
      { align: "center" },
    )

    yPos += 15

    // Si hay productos, mostrarlos en una tabla
    if (order.orderItems && order.orderItems.length > 0) {
      const tableData = order.orderItems.map((item, index) => [
        (index + 1).toString(),
        item.productName,
        item.quantity.toString(),
        formatCurrency(item.price),
        formatCurrency(item.quantity * item.price),
      ])

      // Mostrar tabla de productos
      autoTable(doc, {
        head: [["#", "Producto", "Cantidad", "Precio Unitario", "Total"]],
        body: tableData,
        startY: yPos,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: [200, 200, 200],
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [COLORS.primary.replace("#", "")],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
        },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 15 }, // #
          1: { cellWidth: "auto" }, // Producto
          2: { cellWidth: 25 }, // Cantidad
          3: { cellWidth: 40 }, // Precio
          4: { cellWidth: 40 }, // Total
        },
      })

      // Actualizar posición Y después de la tabla
      const tableHeight = order.orderItems.length * 8 + 10 // Estimación de altura
      yPos += tableHeight + 15

      // Mostrar total del pedido
      doc.setFontSize(9)
      doc.setTextColor(COLORS.text)
      doc.setFont("helvetica", "bold")
      doc.text(`Total del pedido: ${formatCurrency(order.total)}`, pageWidth - 30, yPos - 5, { align: "right" })

      // Si hay notas, mostrarlas
      if (order.notes) {
        doc.setFontSize(8)
        doc.setFont("helvetica", "italic")
        doc.text(`Notas: ${order.notes}`, 20, yPos, { maxWidth: pageWidth - 40 })
        yPos += 10
      }

      // Separador entre pedidos
      doc.setDrawColor(COLORS.lightText)
      doc.setLineWidth(0.2)
      doc.line(20, yPos, pageWidth - 20, yPos)
      yPos += 15
    }
  }
}

/**
 * Añade el pie de página al documento PDF
 * @param doc Documento PDF
 */
function addFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height

  // Para cada página
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Añadir línea separadora a 10mm del borde inferior
    doc.setDrawColor(COLORS.primary)
    doc.setLineWidth(0.5)
    doc.line(10, pageHeight - 10, pageWidth - 10, pageHeight - 10)

    // Añadir texto del pie de página
    doc.setFontSize(8)
    doc.setTextColor(COLORS.lightText)
    doc.text("© Farmacias Brasil - Sistema de Gestión", pageWidth / 2, pageHeight - 5, { align: "center" })

    // Añadir número de página
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, pageHeight - 5)
  }
}

/**
 * Formatea una fecha para mostrarla en formato legible
 * @param dateString Fecha en formato string
 * @returns Fecha formateada
 */
function formatOrderDate(dateString: string): string {
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

// Cambiar la función formatCurrency para usar USD en lugar de BRL
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

/**
 * Obtiene una etiqueta legible para el estado
 * @param status Estado del pedido
 * @returns Etiqueta legible
 */
function getStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case "pendiente":
      return "Pendiente"
    case "recibido":
      return "Recibido"
    case "cancelado":
      return "Cancelado"
    default:
      return status
  }
}

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { Supplier } from "@/types/suppliers"

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
 * Genera un PDF elegante con los datos de proveedores
 * @param suppliers Lista de proveedores a incluir en el PDF
 * @returns Blob con el PDF generado
 */
export async function generateSuppliersPDF(suppliers: Supplier[]): Promise<Blob> {
  // Crear un nuevo documento PDF con orientación horizontal para más espacio
  const doc = new jsPDF({
    orientation: "landscape", // Orientación horizontal para más espacio
    unit: "mm",
    format: "a4",
  })

  // Añadir metadatos al documento
  doc.setProperties({
    title: "Listado de Proveedores - Farmacias Brasil",
    subject: "Reporte de proveedores",
    author: "Sistema de Gestión Farmacias Brasil",
    keywords: "proveedores, farmacias, brasil, reporte",
    creator: "Farmacias Brasil",
  })

  // Configurar fuentes
  doc.setFont("helvetica", "normal")

  // Añadir encabezado con logo y título
  await addHeader(doc)

  // Añadir título del reporte
  doc.setFontSize(18)
  doc.setTextColor(COLORS.primary)
  doc.text("Listado de Proveedores", 148, 30, { align: "center" }) // Ajustado para orientación horizontal

  // Añadir fecha del reporte
  doc.setFontSize(10)
  doc.setTextColor(COLORS.lightText)
  const today = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  doc.text(`Generado el ${today}`, 148, 36, { align: "center" }) // Ajustado para orientación horizontal

  // Añadir tabla de proveedores
  addSuppliersTable(doc, suppliers)

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
 * Añade la tabla de proveedores al documento PDF
 * @param doc Documento PDF
 * @param suppliers Lista de proveedores
 */
function addSuppliersTable(doc: jsPDF, suppliers: Supplier[]): void {
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const tableWidth = pageWidth - 20 // 10mm de margen a cada lado

  // Calcular el espacio para el pie de página (15mm desde el borde inferior)
  const footerHeight = 15

  // Preparar los datos para la tabla - Mostrar todos los datos completos
  const tableData = suppliers.map((supplier) => [
    supplier.id.toString(),
    supplier.name,
    supplier.contact,
    supplier.email,
    supplier.phone,
    supplier.address || "", // Mostrar la dirección completa
    supplier.category,
    supplier.status === "active" ? "Activo" : supplier.status === "inactive" ? "Inactivo" : "Pendiente",
    supplier.products.toString(),
    supplier.lastOrder || "N/A",
  ])

  // Configurar la tabla
  autoTable(doc, {
    head: [
      [
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
      ],
    ],
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
      0: { cellWidth: tableWidth * 0.05 }, // ID (5%)
      1: { cellWidth: tableWidth * 0.15 }, // Nombre (15%)
      2: { cellWidth: tableWidth * 0.1 }, // Contacto (10%)
      3: { cellWidth: tableWidth * 0.15 }, // Email (15%)
      4: { cellWidth: tableWidth * 0.1 }, // Teléfono (10%)
      5: { cellWidth: tableWidth * 0.15 }, // Dirección (15%)
      6: { cellWidth: tableWidth * 0.1 }, // Categoría (10%)
      7: { cellWidth: tableWidth * 0.07 }, // Estado (7%)
      8: { cellWidth: tableWidth * 0.06 }, // Productos (6%)
      9: { cellWidth: tableWidth * 0.07 }, // Último Pedido (7%)
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
    // Ajustar automáticamente la altura de la celda según el contenido
    willDrawCell: (data) => {
      const cell = data.cell
      if (cell.text && cell.text.length > 0) {
        // Si el texto es largo, asegurar que la celda tenga suficiente altura
        const textLength = cell.text.join("").length
        if (textLength > 30) {
          cell.styles.minCellHeight = Math.max(cell.styles.minCellHeight || 0, 10)
        }
      }
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

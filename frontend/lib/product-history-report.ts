import type { Product, InventoryTransaction } from "@/types/inventory"
import jsPDF from "jspdf"
import "jspdf-autotable"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Función para generar el PDF del historial de transacciones de un producto
export async function generateProductHistoryPDF(
  product: Product,
  transactions: InventoryTransaction[],
): Promise<Uint8Array> {
  // Crear un nuevo documento PDF
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Configuración de colores
  const primaryColor = [34, 139, 34] as [number, number, number] // Verde oscuro en RGB
  const secondaryColor = [51, 51, 51] as [number, number, number] // Casi negro en RGB

  // Configuración de página
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 15

  // Función para dibujar el encabezado
  const drawHeader = () => {
    // Rectángulo de encabezado
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(margin, margin, pageWidth - 2 * margin, 20, "F")

    // Título del reporte
    doc.setTextColor(255, 255, 255) // Blanco
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("HISTORIAL DE TRANSACCIONES DE PRODUCTO", margin + 5, margin + 8)

    // Fecha de generación
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    const currentDate = format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
    doc.text(`Generado: ${currentDate}`, margin + 5, margin + 15)
  }

  // Función para dibujar el pie de página
  const drawFooter = (pageNumber: number, totalPages: number) => {
    // Línea separadora
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(margin, pageHeight - margin - 10, pageWidth - margin, pageHeight - margin - 10)

    // Texto de pie de página
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text("Farmacias Brasil - Sistema de Gestión", margin, pageHeight - margin - 5)

    // Número de página
    doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - margin - 25, pageHeight - margin - 5)
  }

  // Función para dibujar la información del producto
  const drawProductInfo = () => {
    // Rectángulo de fondo
    doc.setFillColor(240, 240, 240)
    doc.setDrawColor(200, 200, 200)
    doc.rect(margin, margin + 25, pageWidth - 2 * margin, 25, "FD")

    // Título de la sección
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("Información del Producto", margin + 5, margin + 32)

    // Datos del producto
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`Nombre: ${product.name}`, margin + 5, margin + 38)
    doc.text(`SKU: ${product.sku || "N/A"}`, margin + 5, margin + 43)
    doc.text(`Categoría: ${product.category || "Sin categoría"}`, margin + 80, margin + 38)
    doc.text(`Stock Actual: ${product.stock}`, margin + 80, margin + 43)
  }

  // Función para dibujar el resumen de transacciones
  const drawTransactionsSummary = (y: number) => {
    // Calcular estadísticas
    const totalTransactions = transactions.length
    const incomingCount = transactions.filter((t) => t.quantity > 0).length
    const outgoingCount = transactions.filter((t) => t.quantity < 0).length
    const totalQuantityChange = transactions.reduce((sum, t) => sum + t.quantity, 0)

    // Rectángulo de fondo
    doc.setFillColor(240, 240, 240)
    doc.setDrawColor(200, 200, 200)
    doc.rect(margin, y, pageWidth - 2 * margin, 25, "FD")

    // Título de la sección
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("Resumen de Transacciones", margin + 5, y + 7)

    // Datos del resumen
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`Total de Transacciones: ${totalTransactions}`, margin + 5, y + 13)
    doc.text(`Entradas: ${incomingCount}`, margin + 5, y + 19)
    doc.text(`Salidas: ${outgoingCount}`, margin + 80, y + 13)

    // Color para el cambio total (rojo si es negativo, verde si es positivo)
    const changeColor =
      totalQuantityChange < 0
        ? ([204, 51, 51] as [number, number, number])
        : ([51, 153, 51] as [number, number, number])
    doc.setTextColor(changeColor[0], changeColor[1], changeColor[2])
    doc.text(`Cambio Total de Stock: ${totalQuantityChange}`, margin + 80, y + 19)

    // Restaurar color de texto
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  }

  // Dibujar encabezado
  drawHeader()

  // Dibujar información del producto
  drawProductInfo()

  // Título de la sección de transacciones
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Historial de Transacciones", margin, margin + 55)

  // Crear tabla de transacciones
  const tableColumn = ["Fecha", "Tipo", "Cantidad", "Usuario", "Notas"]
  const tableRows = transactions.map((transaction) => [
    format(new Date(transaction.date), "dd/MM/yyyy", { locale: es }),
    transaction.type,
    transaction.quantity > 0 ? `+${transaction.quantity}` : `${transaction.quantity}`,
    transaction.userName,
    transaction.notes || "N/A",
  ])

  // Configuración de estilos para la tabla
  const tableStyles = {
    headStyles: {
      fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      2: {
        // Columna de cantidad (índice 2)
        cellCallback: (cell: any, data: any) => {
          const value = data.cell.raw
          if (value.startsWith("+")) {
            cell.styles.textColor = [51, 153, 51] // Verde para valores positivos
          } else {
            cell.styles.textColor = [204, 51, 51] // Rojo para valores negativos
          }
        },
      },
    },
    margin: { top: margin + 60 },
  }

  // Generar la tabla
  // @ts-ignore - jspdf-autotable extiende jsPDF pero TypeScript no lo reconoce
  doc.autoTable(tableColumn, tableRows, tableStyles)

  // Obtener la posición Y final de la tabla
  // @ts-ignore - finalY es una propiedad añadida por autoTable
  const finalY = (doc as any).lastAutoTable.finalY || margin + 60

  // Si hay espacio suficiente, dibujar el resumen
  if (finalY + 30 < pageHeight - margin - 10) {
    drawTransactionsSummary(finalY + 10)
  } else {
    // Si no hay espacio, añadir una nueva página y dibujar el resumen
    doc.addPage()
    drawHeader()
    drawTransactionsSummary(margin + 30)
  }

  // Dibujar pie de página en todas las páginas
  // Usar una aserción de tipo para acceder a getNumberOfPages
  const totalPages = (doc.internal as any).getNumberOfPages() || 1
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    drawFooter(i, totalPages)
  }

  // Convertir el documento a un array de bytes
  const pdfBytes = doc.output("arraybuffer")
  return new Uint8Array(pdfBytes)
}

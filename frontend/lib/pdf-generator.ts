import jsPDF from "jspdf"
import "jspdf-autotable"
import { format } from "date-fns"
import type { TransactionDetails } from "@/services/dashboard-service"

// Extender el tipo jsPDF para incluir autotable con su propiedad previous
declare module "jspdf" {
  interface jsPDF {
    autoTable: ((options: any) => jsPDF) & {
      previous?: {
        finalY: number
      }
    }
  }
}

export function generateTransactionPDF(transaction: TransactionDetails): Blob {
  // Crear un nuevo documento PDF
  const doc = new jsPDF()

  // Añadir el logo
  // Aquí usamos una URL relativa que funcionará cuando se ejecute en el navegador
  const logoWidth = 50 // Ancho del logo en mm
  const logoHeight = 20 // Altura aproximada manteniendo la proporción
  const logoX = 15 // Posición X del logo
  const logoY = 10 // Posición Y del logo

  try {
    // Añadir imagen desde URL pública
    doc.addImage("/farmacias-brasil-logo.jpg", "JPG", logoX, logoY, logoWidth, logoHeight)
  } catch (error) {
    console.error("Error al añadir el logo al PDF:", error)
    // Si hay error, continuamos sin el logo
  }

  // Información de la farmacia (ahora posicionada más abajo debido al logo)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text("Boulevard Los Próceres, #123, San Salvador, El Salvador", 105, 40, { align: "center" })
  doc.text("Tel: +503 2606-0000 | Email: info@farmaciasbrasil.com", 105, 45, { align: "center" })

  // Línea separadora
  doc.setLineWidth(0.5)
  doc.line(15, 50, 195, 50)

  // Título del documento
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("DETALLE DE TRANSACCIÓN", 105, 60, { align: "center" })

  // Información de la transacción
  doc.setFontSize(11)
  doc.text("Información de la Transacción", 15, 70)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  // Crear tabla de información
  const transactionInfo = [
    ["ID de Transacción:", transaction.id],
    ["Fecha:", format(new Date(transaction.date), "dd/MM/yyyy HH:mm")],
    ["Cliente:", transaction.customer],
    [
      "Estado:",
      transaction.status === "completed" ? "Completado" : transaction.status === "pending" ? "Pendiente" : "Cancelado",
    ],
    ["Método de Pago:", transaction.paymentMethod || "No especificado"],
  ]

  doc.autoTable({
    startY: 75,
    head: [],
    body: transactionInfo,
    theme: "plain",
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: "bold" },
      1: { cellWidth: 60 },
    },
  })

  // Productos
  doc.setFont("helvetica", "bold")
  // Usar una variable para almacenar la posición Y después de la tabla
  const infoTableEndY = doc.autoTable.previous?.finalY || 120
  doc.text("Productos", 15, infoTableEndY + 10)

  // Tabla de productos
  const productsTableHead = [["Producto", "Cantidad", "Precio Unitario", "Total"]]
  const productsTableBody = transaction.products.map((product) => [
    product.name,
    product.quantity.toString(),
    `$${product.unitPrice.toFixed(2)}`,
    `$${product.total.toFixed(2)}`,
  ])

  doc.autoTable({
    startY: infoTableEndY + 15,
    head: productsTableHead,
    body: productsTableBody,
    theme: "striped",
    headStyles: { fillColor: [66, 66, 66] },
    styles: { fontSize: 9 },
  })

  // Resumen de totales
  // Usar una variable para almacenar la posición Y después de la tabla de productos
  const productsTableEndY = doc.autoTable.previous?.finalY || 200
  const summaryY = productsTableEndY + 10

  doc.setFont("helvetica", "normal")
  doc.text("Subtotal:", 140, summaryY)
  doc.text(`$${transaction.subtotal.toFixed(2)}`, 190, summaryY, { align: "right" })

  doc.text("IVA (13%):", 140, summaryY + 7)
  doc.text(`$${transaction.tax.toFixed(2)}`, 190, summaryY + 7, { align: "right" })

  doc.setLineWidth(0.2)
  doc.line(140, summaryY + 10, 190, summaryY + 10)

  doc.setFont("helvetica", "bold")
  doc.text("TOTAL:", 140, summaryY + 17)
  doc.text(`$${transaction.amount.toFixed(2)}`, 190, summaryY + 17, { align: "right" })

  // Pie de página
  const pageHeight = doc.internal.pageSize.height
  doc.setFont("helvetica", "italic")
  doc.setFontSize(8)
  doc.text("Este documento es un comprobante de transacción. Gracias por su compra.", 105, pageHeight - 15, {
    align: "center",
  })
  doc.text(`Impreso el: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 105, pageHeight - 10, { align: "center" })

  // Convertir el documento a Blob
  const pdfBlob = doc.output("blob")
  return pdfBlob
}


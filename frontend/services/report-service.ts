// Servicio para manejar la generación y visualización de reportes
import type { Product, InventoryTransaction } from "@/types/inventory"
import { generateProductHistoryPDF } from "@/lib/product-history-report"

// Función para abrir un PDF en una nueva pestaña
export const openPDFInNewTab = (pdfBytes: Uint8Array): void => {
  // Convertir el array de bytes a un Blob
  const blob = new Blob([pdfBytes], { type: "application/pdf" })

  // Crear una URL para el Blob
  const url = URL.createObjectURL(blob)

  // Abrir la URL en una nueva pestaña
  window.open(url, "_blank")

  // Liberar la URL después de un tiempo para evitar fugas de memoria
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 30000) // 30 segundos, tiempo suficiente para que se cargue el PDF
}

// Función para generar y mostrar el reporte de historial de producto
export const showProductHistoryReport = async (
  product: Product,
  transactions: InventoryTransaction[],
): Promise<void> => {
  try {
    // Generar el PDF
    const pdfBytes = await generateProductHistoryPDF(product, transactions)

    // Abrir el PDF en una nueva pestaña
    openPDFInNewTab(pdfBytes)
  } catch (error) {
    console.error("Error al generar el reporte de historial de producto:", error)
    throw error
  }
}

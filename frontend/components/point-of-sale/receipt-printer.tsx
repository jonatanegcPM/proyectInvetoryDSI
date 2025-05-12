"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Printer, Download, Share2, X } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import type { CartItem } from "@/types/point-of-sale"
import type { Customer } from "@/services/pos-service"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useAuth } from "@/contexts/auth-context"

interface ReceiptPrinterProps {
  isOpen: boolean
  onClose: () => void
  saleData: {
    saleId: number
    date: Date
    items: CartItem[]
    customer: Customer | null
    subtotal: number
    tax: number
    total: number
    paymentMethod: string
  }
}

export function ReceiptPrinter({ isOpen, onClose, saleData }: ReceiptPrinterProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const [printProgress, setPrintProgress] = useState(0)
  const [isFullyPrinted, setIsFullyPrinted] = useState(false)
  const [isPrintingToSystem, setIsPrintingToSystem] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Reset states when receipt is opened
  useEffect(() => {
    if (isOpen) {
      setIsPrinting(false)
      setPrintProgress(0)
      setIsFullyPrinted(false)
      setIsPrintingToSystem(false)

      // Auto-start printing after a shorter delay
      const timer = setTimeout(() => {
        handlePrint()
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Handle the printing animation
  const handlePrint = () => {
    setIsPrinting(true)

    // Simulate printing progress - FASTER VERSION
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setPrintProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsPrinting(false)
          setIsFullyPrinted(true)
        }, 200)
      }
    }, 50)
  }

  // Handle actual printing via browser - DIRECT PRINT DIALOG WITH PRESERVED DESIGN
  const handleBrowserPrint = async () => {
    if (!receiptRef.current || isPrintingToSystem) return

    try {
      setIsPrintingToSystem(true)

      // First, capture the receipt as an image to preserve exact styling
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      })

      const receiptImage = canvas.toDataURL("image/png")

      // Create a hidden iframe
      const printFrame = document.createElement("iframe")
      printFrame.style.position = "fixed"
      printFrame.style.right = "0"
      printFrame.style.bottom = "0"
      printFrame.style.width = "0"
      printFrame.style.height = "0"
      printFrame.style.border = "0"

      // Add the iframe to the document
      document.body.appendChild(printFrame)

      // Make sure we have access to the iframe document
      const frameDoc = printFrame.contentWindow?.document
      if (!frameDoc) {
        document.body.removeChild(printFrame)
        throw new Error("No se pudo acceder al documento del iframe")
      }

      // Write the receipt image to the iframe
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Recibo #${saleData.saleId}</title>
          <style>
            @page { 
              size: 80mm 297mm; 
              margin: 0; 
            }
            body { 
              margin: 0; 
              padding: 0; 
              display: flex;
              flex-direction: column;
              align-items: center;
              background-color: white;
              width: 80mm;
            }
            .receipt-container {
              width: 80mm;
              padding: 10px;
              box-sizing: border-box;
            }
            .receipt-image {
              width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <img src="${receiptImage}" alt="Recibo de venta" class="receipt-image" />
          </div>
        </body>
        </html>
      `)

      frameDoc.close()

      // Wait for the iframe to load
      printFrame.onload = () => {
        try {
          // Focus the iframe and print
          if (printFrame.contentWindow) {
            printFrame.contentWindow.focus()

            // Print after a short delay to ensure content is loaded
            setTimeout(() => {
              if (printFrame.contentWindow) {
                printFrame.contentWindow.print()

                // Remove the iframe after printing
                setTimeout(() => {
                  document.body.removeChild(printFrame)
                  setIsPrintingToSystem(false)
                }, 1000)
              }
            }, 500)
          }
        } catch (error) {
          console.error("Error during print:", error)
          document.body.removeChild(printFrame)
          setIsPrintingToSystem(false)
          throw error
        }
      }

      toast({
        title: "Imprimiendo",
        description: "Preparando el recibo para imprimir...",
        variant: "success",
      })
    } catch (error) {
      console.error("Error printing:", error)
      setIsPrintingToSystem(false)
      toast({
        title: "Error",
        description: "No se pudo imprimir el recibo",
        variant: "destructive",
      })
    }
  }

  // Handle downloading as PDF
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, Math.min(297, (canvas.height * 80) / canvas.width)],
      })

      pdf.addImage(imgData, "PNG", 0, 0, 80, (canvas.height * 80) / canvas.width)
      pdf.save(`recibo-${saleData.saleId}.pdf`)

      toast({
        title: "PDF generado",
        description: "El recibo se ha descargado como PDF",
        variant: "success",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      })
    }
  }

  // Handle sharing receipt
  const handleShare = async () => {
    if (!receiptRef.current) return

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      })

      canvas.toBlob(async (blob) => {
        if (!blob) return

        if (navigator.share) {
          const file = new File([blob], `recibo-${saleData.saleId}.png`, { type: "image/png" })

          try {
            await navigator.share({
              title: `Recibo #${saleData.saleId}`,
              text: "Recibo de compra de Farmacias Brasil",
              files: [file],
            })

            toast({
              title: "Compartido",
              description: "El recibo se ha compartido correctamente",
              variant: "success",
            })
          } catch (error) {
            console.error("Error sharing:", error)
            toast({
              title: "Error",
              description: "No se pudo compartir el recibo",
              variant: "destructive",
            })
          }
        } else {
          toast({
            title: "No disponible",
            description: "La función de compartir no está disponible en este dispositivo",
            variant: "destructive",
          })
        }
      }, "image/png")
    } catch (error) {
      console.error("Error generating image:", error)
      toast({
        title: "Error",
        description: "No se pudo generar la imagen para compartir",
        variant: "destructive",
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-auto flex h-full max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-lg bg-white p-4 shadow-xl dark:bg-gray-900">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold">Recibo de Venta</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Printer animation */}
        <div className="relative mb-4 h-6 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          {isPrinting && (
            <motion.div
              className="absolute left-0 top-0 h-full bg-green-500"
              initial={{ width: "0%" }}
              animate={{ width: `${printProgress}%` }}
              transition={{ ease: "linear" }}
            />
          )}
          <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center text-xs font-medium">
            {isPrinting ? "Imprimiendo..." : isFullyPrinted ? "Impresión completada" : "Listo para imprimir"}
          </div>
        </div>

        {/* Receipt container with paper-like styling */}
        <div className="relative flex-1 overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800">
          {/* Printer head effect */}
          <div className="absolute left-0 right-0 top-0 z-10 h-4 bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-700"></div>

          {/* Perforated edges */}
          <div className="absolute left-0 top-0 h-full w-2 border-r border-dashed border-gray-300 dark:border-gray-600"></div>
          <div className="absolute right-0 top-0 h-full w-2 border-l border-dashed border-gray-300 dark:border-gray-600"></div>

          {/* Scrollable receipt content */}
          <div className="h-full overflow-y-auto px-6 py-4">
            <AnimatePresence>
              {(isPrinting || isFullyPrinted) && (
                <motion.div
                  ref={receiptRef}
                  className="mx-auto w-full max-w-[280px] font-mono text-sm"
                  initial={{ y: "-100%" }}
                  animate={{ y: isFullyPrinted ? 0 : `${100 - printProgress}%` }}
                  transition={{ ease: "linear" }}
                >
                  {/* Receipt header */}
                  <div className="mb-4 text-center">
                    <div className="mb-1 text-lg font-bold">FARMACIAS BRASIL</div>
                    <div className="text-xs">
                      Boulevard Los Próceres, #123
                      <br />
                      San Salvador, El Salvador
                      <br />
                      Tel: +503 2606-0000
                      <br />
                      NIT: 0614-010190-101-0
                    </div>
                  </div>

                  {/* Receipt info */}
                  <div className="mb-3 text-xs">
                    <div className="flex justify-between">
                      <span>RECIBO #:</span>
                      <span>{String(saleData.saleId).padStart(8, "0")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>FECHA:</span>
                      <span>{format(saleData.date, "dd/MM/yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HORA:</span>
                      <span>{format(saleData.date, "HH:mm:ss")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CAJERO:</span>
                      <span>{user?.name || "Usuario"}</span>
                    </div>
                  </div>

                  {/* Customer info */}
                  {saleData.customer && (
                    <div className="mb-3 text-xs">
                      <div className="mb-1 font-bold">CLIENTE:</div>
                      <div>{saleData.customer.name}</div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="my-3 border-t border-dashed border-gray-400"></div>

                  {/* Items */}
                  <div className="mb-3">
                    <div className="mb-1 font-bold text-xs">PRODUCTOS:</div>
                    {saleData.items.map((item, index) => (
                      <div key={index} className="mb-2 text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium">{item.name}</span>
                          <span>${item.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pl-2">
                          <span>
                            {item.quantity} x ${item.price.toFixed(2)}
                          </span>
                          <span>${(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="my-3 border-t border-dashed border-gray-400"></div>

                  {/* Totals */}
                  <div className="mb-3 text-xs">
                    <div className="flex justify-between">
                      <span>SUBTOTAL:</span>
                      <span>${saleData.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA (13%):</span>
                      <span>${saleData.tax.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 flex justify-between font-bold">
                      <span>TOTAL:</span>
                      <span>${saleData.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment method */}
                  <div className="mb-3 text-xs">
                    <div className="flex justify-between">
                      <span>MÉTODO DE PAGO:</span>
                      <span>{saleData.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-3 border-t border-dashed border-gray-400"></div>

                  {/* Footer */}
                  <div className="mb-6 text-center text-[10px]">
                    <p className="mb-2">¡GRACIAS POR SU COMPRA!</p>
                    <p className="mb-2">
                      Para devoluciones presentar este recibo
                      <br />
                      dentro de los próximos 7 días.
                    </p>
                    <p>
                      Consulte a su médico o farmacéutico
                      <br />
                      antes de consumir medicamentos.
                    </p>
                    <div className="mt-4 text-[8px]">www.farmaciasbrasil.com</div>
                  </div>

                  {/* Receipt ID */}
                  <div className="mb-8 text-center text-[10px]">{String(saleData.saleId).padStart(10, "0")}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center gap-1 py-4"
            onClick={handleBrowserPrint}
            disabled={!isFullyPrinted || isPrintingToSystem}
          >
            <Printer className="h-5 w-5" />
            <span className="text-xs">Imprimir</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center gap-1 py-4"
            onClick={handleDownloadPDF}
            disabled={!isFullyPrinted}
          >
            <Download className="h-5 w-5" />
            <span className="text-xs">Descargar</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center gap-1 py-4"
            onClick={handleShare}
            disabled={!isFullyPrinted || !navigator.share}
          >
            <Share2 className="h-5 w-5" />
            <span className="text-xs">Compartir</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

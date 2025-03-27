"use client"

import { useState, useEffect, useRef } from "react"
import type { Product, Customer, CartItem } from "@/types/point-of-sale"

// Datos de ejemplo para productos
const productsData: Product[] = [
  { id: 1, name: "Amoxicilina 500mg", price: 15.99, category: "Antibióticos", barcode: "7401094602232", stock: 45 },
  { id: 2, name: "Lisinopril 10mg", price: 12.5, category: "Presión Arterial", barcode: "7509876543210", stock: 32 },
  { id: 3, name: "Metformina 500mg", price: 8.75, category: "Diabetes", barcode: "7501122334455", stock: 18 },
  { id: 4, name: "Ibuprofeno 200mg", price: 5.99, category: "Analgésicos", barcode: "7506677889900", stock: 56 },
  { id: 5, name: "Omeprazol 20mg", price: 18.25, category: "Antiácidos", barcode: "7505544332211", stock: 27 },
]

// Datos de ejemplo para clientes
const customersData: Customer[] = [
  { id: 1, name: "Juan Pérez", email: "juan@ejemplo.com", phone: "123-456-7890" },
  { id: 2, name: "María García", email: "maria@ejemplo.com", phone: "098-765-4321" },
]

export function usePointOfSale() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanMessage, setScanMessage] = useState("")
  const [scanError, setScanError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const barcodeBuffer = useRef("")
  const lastScanTime = useRef(0)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const toggleScanning = () => {
    setIsScanning(!isScanning)
  }

  useEffect(() => {
    if (isScanning) {
      document.addEventListener("keydown", handleBarcodeScan)
      setScanMessage("Escaneando productos... Pase el código de barras por el lector")
      setScanError("")
    } else {
      document.removeEventListener("keydown", handleBarcodeScan)
      setScanMessage("")
    }

    return () => {
      document.removeEventListener("keydown", handleBarcodeScan)
    }
  }, [isScanning])

  const handleBarcodeScan = (event: KeyboardEvent) => {
    // Evitar que el evento se propague a otros elementos
    if (isScanning) {
      // Verificar si es un evento de teclado real o del lector de código de barras
      const currentTime = new Date().getTime()
      const timeDiff = currentTime - lastScanTime.current

      // Los lectores de código de barras suelen enviar caracteres muy rápidamente
      if (event.key === "Enter") {
        event.preventDefault()
        if (barcodeBuffer.current.length > 0) {
          findProductByBarcode(barcodeBuffer.current)
          barcodeBuffer.current = ""
        }
      } else {
        // Solo agregar al buffer si es un carácter alfanumérico
        if (/^[a-zA-Z0-9]$/.test(event.key)) {
          barcodeBuffer.current += event.key
          lastScanTime.current = currentTime
        }
      }
    }
  }

  const searchProducts = (term: string) => {
    // Esta función simula una búsqueda en la API
    // En una implementación real, aqui se hace una llamada a la API
    return productsData.filter((product) => product.name.toLowerCase().includes(term.toLowerCase()))
  }

  const findProductByBarcode = (barcode: string) => {
    // Simula una llamada a la API para buscar un producto por código de barras
    // En una implementación real, aqui se hace una llamada a la API
    const product = productsData.find((p) => p.barcode === barcode)
    if (product) {
      addToCart(product)
      setScanMessage(`Producto escaneado: ${product.name}`)
      setScanError("")
    } else {
      setScanError(`No se encontró ningún producto con el código de barras: ${barcode}`)
      setTimeout(() => setScanError(""), 3000)
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)))
    }
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)
  }

  const filteredProducts = searchProducts(searchTerm)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const changeItemsPerPage = (value: string) => {
    setItemsPerPage(Number.parseInt(value))
    setCurrentPage(1) // Volver a la primera página al cambiar los elementos por página
  }

  const handleCustomerSelect = (customerId: string) => {
    const customer = customersData.find((c) => c.id === Number.parseInt(customerId))
    setSelectedCustomer(customer || null)
  }

  const completeSale = async () => {
    if (cart.length === 0 || !selectedCustomer || !paymentMethod) return

    setIsProcessing(true)

    try {
      // Simula una llamada a la API para procesar la venta
      // En una implementación real, aqui se hace una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newSale = {
        id: Math.floor(Math.random() * 10000),
        customerId: selectedCustomer.id,
        items: [...cart],
        total: Number.parseFloat(calculateTotal()),
        paymentMethod,
        date: new Date(),
      }

      // Aquí se enviaría newSale a la API
      console.log("Venta completada:", newSale)

      // Limpiar el carrito y resetear estados
      setCart([])
      setSelectedCustomer(null)
      setPaymentMethod("")
      alert("¡Venta completada con éxito!")
    } catch (error) {
      console.error("Error al procesar la venta:", error)
      alert("Error al procesar la venta. Inténtelo de nuevo.")
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    // Datos
    cart,
    selectedCustomer,
    paymentMethod,
    searchTerm,
    isScanning,
    scanMessage,
    scanError,
    isProcessing,
    currentProducts,
    filteredProducts,
    customersData,

    // Funciones
    setSearchTerm,
    toggleScanning,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    setPaymentMethod,
    completeSale,
    handleCustomerSelect,

    // Paginación
    currentPage,
    itemsPerPage,
    totalPages,
    nextPage,
    prevPage,
    changeItemsPerPage,
    indexOfFirstItem,
    indexOfLastItem,
  }
}


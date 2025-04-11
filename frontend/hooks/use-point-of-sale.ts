"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { toast } from "@/hooks/use-toast"
import type { CartItem } from "@/types/point-of-sale"
import { POSService, type Product, type Customer } from "@/services/pos-service"

export function usePointOfSale() {
  // Estados para el carrito y la venta
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>("")

  // Estados para la búsqueda y escaneo
  const [searchTerm, setSearchTerm] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanMessage, setScanMessage] = useState("")
  const [scanError, setScanError] = useState("")

  // Estados para la carga de datos
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  })

  // Mejorar la experiencia de carga para evitar flashes de loading
  // Añadir un estado para controlar el loading inicial vs. el loading de búsqueda
  // Añadir después de la declaración de estados:

  const [initialLoading, setInitialLoading] = useState(true)

  // Referencias para el escaneo de códigos de barras
  const barcodeBuffer = useRef("")
  const lastScanTime = useRef(0)

  // Cargar productos

  const fetchProducts = useCallback(
    async (page = 1, limit = 10) => {
      const isInitialLoad = initialLoading
      if (!isInitialLoad) {
        setIsLoading(true)
      }

      try {
        const response = await POSService.getProducts(searchTerm, page, limit)
        setProducts(response.products)
        setPagination(response.pagination)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        if (isInitialLoad) {
          setInitialLoading(false)
        }
      }
    },
    [searchTerm, initialLoading],
  )

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await POSService.getCustomers()
      setCustomers(response.customers) // Acceder a la propiedad customers del objeto response
    } catch (error) {
      console.error("Error fetching customers:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      })
    }
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    fetchProducts()
    fetchCustomers()
  }, [fetchProducts, fetchCustomers])

  // Efecto para recargar productos cuando cambia el término de búsqueda
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(1, pagination.limit)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, fetchProducts, pagination.limit])

  // Activar/desactivar el escáner de códigos de barras
  const toggleScanning = () => {
    setIsScanning(!isScanning)
  }

  // Manejar el escaneo de códigos de barras
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
          // Importante: Guardar el código de barras actual antes de limpiarlo
          const currentBarcode = barcodeBuffer.current
          barcodeBuffer.current = ""

          // Buscar y agregar el producto después de limpiar el buffer
          findProductByBarcode(currentBarcode)
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

  // Buscar producto por código de barras
  const findProductByBarcode = async (barcode: string) => {
    try {
      setScanMessage(`Buscando producto con código: ${barcode}...`)
      const response = await POSService.getProductByBarcode(barcode)

      if (response.product) {
        addToCart(response.product)
        setScanMessage(`Producto escaneado: ${response.product.name}`)
        setScanError("")
      } else {
        setScanError(`No se encontró ningún producto con el código de barras: ${barcode}`)
        setTimeout(() => setScanError(""), 3000)
      }
    } catch (error) {
      console.error("Error finding product by barcode:", error)
      setScanError(`Error al buscar el producto: ${barcode}`)
      setTimeout(() => setScanError(""), 3000)
    }
  }

  // Agregar producto al carrito
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
  }

  // Eliminar producto del carrito
  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.id !== productId))
  }

  // Actualizar cantidad de un producto en el carrito
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)))
    }
  }

  // Calcular el total del carrito
  const calculateTotal = () => {
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
    const tax = subtotal * 0.13 // 13% de impuesto
    const total = subtotal + tax
    return total.toFixed(2)
  }

  // Seleccionar cliente
  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.id === Number.parseInt(customerId))
    setSelectedCustomer(customer || null)
  }

  // Completar la venta
  const completeSale = async () => {
    if (cart.length === 0 || !selectedCustomer || !paymentMethod) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
      const tax = subtotal * 0.13 // 13% de impuesto
      const total = subtotal + tax

      // Preparar los datos para la API
      const saleData = {
        customerId: selectedCustomer.id,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        paymentMethod,
        subtotal: subtotal,
        //tax: tax,
        total: total,
      }

      // Agregar log para depuración
      console.log("Enviando datos de venta:", JSON.stringify(saleData, null, 2))

      // Enviar la venta a la API
      const response = await POSService.createSale(saleData)

      // Mostrar mensaje de éxito
      toast({
        title: "Venta completada",
        description: `Venta #${response.id} registrada correctamente`,
        variant: "success",
      })

      // Limpiar el carrito y resetear estados
      setCart([])
      setSelectedCustomer(null)
      setPaymentMethod("")
    } catch (error) {
      console.error("Error al procesar la venta:", error)
      toast({
        title: "Error",
        description: "No se pudo completar la venta. Inténtelo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Paginación
  const nextPage = () => {
    if (pagination.page < pagination.pages) {
      fetchProducts(pagination.page + 1, pagination.limit)
    }
  }

  const prevPage = () => {
    if (pagination.page > 1) {
      fetchProducts(pagination.page - 1, pagination.limit)
    }
  }

  const changeItemsPerPage = (value: string) => {
    const newLimit = Number.parseInt(value)
    fetchProducts(1, newLimit)
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
    isLoading,
    products,
    customers,

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
    currentPage: pagination.page,
    itemsPerPage: pagination.limit,
    totalPages: pagination.pages,
    totalItems: pagination.total,
    nextPage,
    prevPage,
    changeItemsPerPage,
    indexOfFirstItem: (pagination.page - 1) * pagination.limit,
    indexOfLastItem: Math.min(pagination.page * pagination.limit, pagination.total),
  }
}

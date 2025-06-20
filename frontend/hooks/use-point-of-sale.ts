"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { toast } from "@/hooks/use-toast"
import type { CartItem } from "@/types/point-of-sale"
import { POSService, type Product, type Customer } from "@/services/pos-service"
import { PreferencesService } from "@/services/preferences-service"
import { normalizeSearchString } from "@/lib/utils"

export function usePointOfSale() {
  // Obtener preferencias guardadas
  const savedPreferences = PreferencesService.getPointOfSalePreferences()

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
    limit: savedPreferences.productsPerPage,
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
    async (page = 1, limit = savedPreferences.productsPerPage) => {
      const isInitialLoad = initialLoading
      if (!isInitialLoad) {
        setIsLoading(true)
      }

      try {
        const response = await POSService.getProducts("", page, limit)
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
    [initialLoading, savedPreferences.productsPerPage],
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

  // Función para refrescar la lista de clientes (útil después de crear uno nuevo)
  const refreshCustomers = useCallback(async () => {
    try {
      const response = await POSService.getCustomers()
      setCustomers(response.customers)
      return response.customers // Devolver la lista actualizada
    } catch (error) {
      console.error("Error refreshing customers:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar los clientes",
        variant: "destructive",
      })
      return []
    }
  }, [])

  // Función para agregar un cliente a la lista sin recargar todo
  const addCustomerToList = useCallback((newCustomer: Customer) => {
    setCustomers((prevCustomers) => [...prevCustomers, newCustomer])
    return newCustomer
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    fetchProducts()
    fetchCustomers()
  }, [fetchProducts, fetchCustomers])

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

  // Verificar si se puede agregar más cantidad de un producto
  const canAddMoreToCart = (product: Product, quantityToAdd = 1): boolean => {
    const existingItem = cart.find((item) => item.id === product.id)
    const currentQuantity = existingItem ? existingItem.quantity : 0
    const totalQuantity = currentQuantity + quantityToAdd

    // Verificar si hay suficiente stock
    if (totalQuantity > product.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${product.stock} unidades disponibles de ${product.name}`,
        variant: "destructive",
      })
      return false
    }

    return true
  }

  // Agregar producto al carrito
  const addToCart = (product: Product) => {
    // Verificar si hay suficiente stock antes de agregar
    if (!canAddMoreToCart(product)) {
      return
    }

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
      // Verificar si hay suficiente stock antes de actualizar
      const product = products.find((p) => p.id === productId)
      if (product && newQuantity > product.stock) {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${product.stock} unidades disponibles de ${product.name}`,
          variant: "destructive",
        })
        return
      }

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

  // Seleccionar cliente por objeto
  const selectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer)
  }, [])

  // Completar la venta
  const completeSale = async () => {
    if (cart.length === 0 || !selectedCustomer || !paymentMethod) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive",
      })
      return null
    }

    // Verificar stock antes de completar la venta
    const stockError = cart.some((item) => {
      const product = products.find((p) => p.id === item.id)
      return product && item.quantity > product.stock
    })

    if (stockError) {
      toast({
        title: "Error de stock",
        description: "Algunos productos no tienen suficiente stock disponible",
        variant: "destructive",
      })
      return null
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

      // Recargar productos para actualizar el stock
      await fetchProducts(pagination.page, pagination.limit)

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

      // Return the sale result
      return { success: true, id: response.id }
    } catch (error) {
      console.error("Error al procesar la venta:", error)
      toast({
        title: "Error",
        description: "No se pudo completar la venta. Inténtelo de nuevo.",
        variant: "destructive",
      })
      return { success: false }
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

  const changeItemsPerPage = (value: number) => {
    fetchProducts(1, value)
    PreferencesService.setPointOfSalePreferences({ productsPerPage: value })
  }

  // Filtrar productos por término de búsqueda
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products
    }

    return products.filter((product) => {
      return (
        normalizeSearchString(product.name).includes(normalizeSearchString(searchTerm)) ||
        normalizeSearchString(product.description || "").includes(normalizeSearchString(searchTerm)) ||
        (product.barcode && normalizeSearchString(product.barcode).includes(normalizeSearchString(searchTerm)))
      )
    })
  }, [products, searchTerm])

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
    products: filteredProducts,
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
    selectCustomer,
    refreshCustomers,
    addCustomerToList,
    canAddMoreToCart,

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

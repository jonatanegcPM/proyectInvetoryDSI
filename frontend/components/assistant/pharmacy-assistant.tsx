"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, X, Send, Maximize2, Minimize2, User, Loader2, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { getAIResponse } from "@/services/ai"

// Tipos para los mensajes
interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  isLoading?: boolean
  feedback?: "positive" | "negative" | null
}

// Sugerencias rápidas para el usuario
const quickSuggestions = [
  "¿Cómo agregar un nuevo producto?",
  "¿Cómo realizar una venta?",
  "¿Cómo ver el inventario bajo?",
  "¿Cómo exportar reportes?",
]

// Respuestas predefinidas para preguntas comunes
const predefinedResponses: Record<string, string> = {
  hola: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
  ayuda:
    "Puedo ayudarte con varias tareas como gestionar inventario, realizar ventas, consultar reportes y más. ¿Qué necesitas?",
  gracias: "¡De nada! Estoy aquí para ayudarte. Si necesitas algo más, no dudes en preguntar.",
  "¿cómo agregar un nuevo producto?":
    "Para agregar un nuevo producto, ve a la sección de Inventario, haz clic en el botón 'Nuevo Producto' y completa el formulario con los detalles del producto.",
  "¿cómo realizar una venta?":
    "Para realizar una venta, ve a la sección de Punto de Venta, busca los productos que deseas vender, agrégalos al carrito, selecciona un cliente y método de pago, y haz clic en 'Completar Venta'.",
  "¿cómo ver el inventario bajo?":
    "Para ver el inventario bajo, ve al Dashboard y selecciona la pestaña 'Estado del Inventario'. Allí verás los productos con stock crítico o bajo.",
  "¿cómo exportar reportes?":
    "Para exportar reportes, ve a la sección correspondiente (Ventas, Inventario, etc.), busca el botón 'Exportar' y selecciona el formato deseado (PDF, Excel, CSV).",
}

export function PharmacyAssistant() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mensaje de bienvenida inicial
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: Date.now().toString(),
        content: `¡Hola ${user?.name?.split(" ")[0] || ""}! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?`,
        sender: "assistant" as const,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [messages, user])

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Enfoque automático en el input cuando se abre el chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, isMinimized])

  // Función mejorada para enviar mensaje
  const sendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      sender: "assistant",
      timestamp: new Date(),
      isLoading: true,
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInputValue("")
    setIsTyping(true)

    try {
      // Preparar mensajes para la API
      const aiMessages = messages.map(msg => ({
        role: msg.sender as "user" | "assistant",
        content: msg.content
      })).concat({
        role: "user",
        content: inputValue
      })

      // Obtener respuesta de IA
      const response = await getAIResponse(aiMessages)

      setMessages((prev) => {
        const updatedMessages = [...prev]
        const lastIndex = updatedMessages.length - 1
        updatedMessages[lastIndex] = {
          ...updatedMessages[lastIndex],
          content: response.content,
          isLoading: false,
        }
        return updatedMessages
      })
    } catch (error) {
      console.error("Error al procesar mensaje:", error)
      setMessages((prev) => {
        const updatedMessages = [...prev]
        const lastIndex = updatedMessages.length - 1
        updatedMessages[lastIndex] = {
          ...updatedMessages[lastIndex],
          content: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.",
          isLoading: false,
        }
        return updatedMessages
      })
    } finally {
      setIsTyping(false)
    }
  }

  // Manejar envío con Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Manejar clic en sugerencia rápida
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    setTimeout(() => {
      sendMessage()
    }, 100)
  }

  // Manejar feedback de mensaje
  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg)))
  }

  return (
    <>
      {/* Botón flotante para abrir el chat */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-lg hover:shadow-xl"
        >
          <Bot className="h-6 w-6" />
        </motion.button>
      )}

      {/* Ventana de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={
              isMinimized
                ? { opacity: 1, y: 0, scale: 0.95, height: "auto" }
                : { opacity: 1, y: 0, scale: 1, height: "auto" }
            }
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 w-80 md:w-96 rounded-lg shadow-2xl bg-card border overflow-hidden",
              isMinimized ? "h-14" : "h-[500px] max-h-[80vh]",
            )}
          >
            {/* Encabezado */}
            <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-blue-600 to-green-500 text-white">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <h3 className="font-medium">Asistente Farmacias Brasil</h3>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Contenido del chat (oculto cuando está minimizado) */}
            {!isMinimized && (
              <>
                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-4 h-[calc(500px-120px)]">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}
                      >
                        <div className="flex items-start gap-2 max-w-[80%]">
                          {message.sender === "assistant" && (
                            <Avatar className="h-8 w-8 mt-0.5">
                              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-green-500 text-white">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div className="space-y-1">
                            <div
                              className={cn(
                                "rounded-lg p-3",
                                message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                              )}
                            >
                              {message.isLoading ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>Escribiendo...</span>
                                </div>
                              ) : (
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              )}
                            </div>

                            {/* Timestamp */}
                            <p className="text-xs text-muted-foreground px-1">
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>

                            {/* Feedback buttons (solo para mensajes del asistente) */}
                            {message.sender === "assistant" && !message.isLoading && (
                              <div className="flex gap-1 px-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn("h-6 w-6", message.feedback === "positive" && "text-green-500")}
                                  onClick={() => handleFeedback(message.id, "positive")}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn("h-6 w-6", message.feedback === "negative" && "text-red-500")}
                                  onClick={() => handleFeedback(message.id, "negative")}
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>

                          {message.sender === "user" && (
                            <Avatar className="h-8 w-8 mt-0.5">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Sugerencias rápidas */}
                {messages.length < 3 && (
                  <div className="p-2 border-t bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-2">Sugerencias:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs py-1 h-auto"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input para enviar mensaje */}
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Escribe un mensaje..."
                      className="flex-1"
                      disabled={isTyping}
                    />
                    <Button
                      size="icon"
                      onClick={sendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      className="bg-gradient-to-r from-blue-600 to-green-500 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

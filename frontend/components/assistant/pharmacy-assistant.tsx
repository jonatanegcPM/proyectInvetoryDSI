"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { getAIResponse, AIOptions } from "@/services/ai"
import { processMessage } from "@/services/commands"
import { Message, ResponseStyle } from "./types"
import { MessageList } from "./message-list"
import { ChatInput } from "./chat-input"
import { Suggestions } from "./suggestions"
import { ChatHeader } from "./chat-header"

export function PharmacyAssistant() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Estado para el estilo de respuesta ("concise" por defecto)
  const [responseStyle, setResponseStyle] = useState<ResponseStyle>("concise")

  // Mensaje de bienvenida inicial
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `¡Hola ${user?.name?.split(" ")[0] || ""}! Soy tu asistente virtual. Usa comandos o preguntas para interactuar. ¿En qué te ayudo? Ejemplo: "¿Qué es un resfriado?" o "/producto alcohol"`,
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

  // Función para convertir el estilo de respuesta seleccionado a opciones de IA
  const getAIOptions = (): AIOptions => {
    switch (responseStyle) {
      case "concise":
        return { concise: true }
      case "short":
        return { shortAnswers: true }
      default:
        return {}
    }
  }

  // Función para enviar mensaje
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
      // Procesar el mensaje para determinar si es un comando o consulta general
      if (inputValue.startsWith("/")) {
        // Es un comando, usar el procesador de comandos
        const response = await processMessage(inputValue)
        setMessages((prev) => {
          const updatedMessages = [...prev]
          const lastIndex = updatedMessages.length - 1
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            content: response,
            isLoading: false,
          }
          return updatedMessages
        })
      } else {
        // Es una consulta general, usar la IA con las opciones configuradas
        const aiOptions = getAIOptions()
        const response = await getAIResponse([{ role: "user", content: inputValue }], aiOptions)
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
      }
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
  const handleFeedback = (messageId: string, feedback: "thumbs-up" | "thumbs-down") => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg)))
  }

  // Manejar cambio de estilo de respuesta
  const handleResponseStyleChange = (style: ResponseStyle) => {
    setResponseStyle(style)
  }

  // Manejar selección de comando
  const handleCommandSelect = (command: string) => {
    setInputValue(command)
    inputRef.current?.focus()
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
            <ChatHeader 
              isMinimized={isMinimized}
              responseStyle={responseStyle}
              onToggleMinimize={() => setIsMinimized(!isMinimized)}
              onClose={() => setIsOpen(false)}
              onStyleChange={handleResponseStyleChange}
            />

            {/* Contenido del chat (oculto cuando está minimizado) */}
            {!isMinimized && (
              <>
                {/* Lista de mensajes */}
                <MessageList 
                  messages={messages}
                  onFeedback={handleFeedback}
                  messagesEndRef={messagesEndRef}
                />

                {/* Sugerencias rápidas */}
                {messages.length < 3 && (
                  <Suggestions onClick={handleSuggestionClick} />
                )}

                {/* Input para enviar mensaje */}
                <ChatInput 
                  value={inputValue}
                  onChange={setInputValue}
                  onSubmit={sendMessage}
                  onKeyDown={handleKeyDown}
                  onCommandSelect={handleCommandSelect}
                  isLoading={isTyping}
                  inputRef={inputRef}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

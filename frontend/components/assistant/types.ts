// Tipos para los mensajes
export interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  isLoading?: boolean
  feedback?: "thumbs-up" | "thumbs-down" | null
}

// Tipo para configurar el estilo de respuesta
export type ResponseStyle = "normal" | "concise" | "short"

// Opción de estilo de respuesta
export interface StyleOption {
  value: ResponseStyle
  label: string
}

// Comando disponible
export interface Command {
  command: string
  description: string
} 
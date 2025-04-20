import { Button } from "@/components/ui/button"
import { Bot, Maximize2, Minimize2, X } from "lucide-react"
import { StyleSelector } from "./style-selector"
import { ResponseStyle } from "./types"

interface ChatHeaderProps {
  isMinimized: boolean
  responseStyle: ResponseStyle
  onToggleMinimize: () => void
  onClose: () => void
  onStyleChange: (style: ResponseStyle) => void
}

export function ChatHeader({
  isMinimized,
  responseStyle,
  onToggleMinimize,
  onClose,
  onStyleChange,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-blue-600 to-green-500 text-white">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5" />
        <h3 className="font-medium">Asistente Farmacias Brasil</h3>
      </div>
      <div className="flex items-center gap-1">
        {/* Selector de estilo de respuesta */}
        <StyleSelector 
          currentStyle={responseStyle}
          onChange={onStyleChange}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMinimize}
          className="h-8 w-8 text-white hover:bg-white/20"
        >
          {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 
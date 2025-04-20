import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { ResponseStyle, StyleOption } from "./types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Opciones predeterminadas de estilo de respuesta
const DEFAULT_STYLE_OPTIONS: StyleOption[] = [
  { value: "normal", label: "Detallada" },
  { value: "concise", label: "Concisa" },
  { value: "short", label: "Ultra breve" },
]

interface StyleSelectorProps {
  currentStyle: ResponseStyle
  styleOptions?: StyleOption[]
  onChange: (style: ResponseStyle) => void
}

export function StyleSelector({ 
  currentStyle, 
  styleOptions = DEFAULT_STYLE_OPTIONS, 
  onChange 
}: StyleSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="p-2">
          <p className="text-xs font-medium mb-2">Tamaño de respuesta:</p>
          <div className="flex flex-col gap-1">
            {styleOptions.map((option) => (
              <Button
                key={option.value}
                variant={currentStyle === option.value ? "default" : "outline"}
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => onChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
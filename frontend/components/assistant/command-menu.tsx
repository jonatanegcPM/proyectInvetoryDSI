import { Button } from "@/components/ui/button"
import { Command } from "./types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Command as CommandIcon } from "lucide-react"

// Comandos predeterminados
const DEFAULT_COMMANDS: Command[] = [
  { command: "/producto", description: "Buscar información de un producto" },
  { command: "/stock", description: "Verificar el stock de un producto" },
  { command: "/ultimas ventas", description: "Ver las últimas ventas realizadas" },
  { command: "/bajo stock", description: "Ver productos con bajo stock" },
]

interface CommandMenuProps {
  commands?: Command[]
  onSelect: (command: string) => void
}

export function CommandMenu({ commands = DEFAULT_COMMANDS, onSelect }: CommandMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-10">
          <CommandIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <div className="p-2 text-xs text-muted-foreground">
          Comandos disponibles:
        </div>
        {commands.map((cmd, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => onSelect(cmd.command)}
            className="flex flex-col items-start gap-1"
          >
            <span className="font-medium">{cmd.command}</span>
            <span className="text-xs text-muted-foreground">{cmd.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
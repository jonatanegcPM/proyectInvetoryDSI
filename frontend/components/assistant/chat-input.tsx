import { RefObject } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { CommandMenu } from "./command-menu"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onCommandSelect: (command: string) => void
  isLoading: boolean
  inputRef: RefObject<HTMLInputElement | null>
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  onCommandSelect,
  isLoading,
  inputRef,
}: ChatInputProps) {
  return (
    <div className="p-3 border-t">
      <div className="flex gap-2">
        <CommandMenu onSelect={onCommandSelect} />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Escribe un mensaje o usa un comando..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button
          size="icon"
          onClick={onSubmit}
          disabled={!value.trim() || isLoading}
          className="bg-gradient-to-r from-blue-600 to-green-500 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 text-xs text-center text-muted-foreground">
        Powered by DeepSeek
      </div>
    </div>
  )
} 
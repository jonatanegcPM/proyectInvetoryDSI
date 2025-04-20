import { Button } from "@/components/ui/button"

// Sugerencias predeterminadas
const DEFAULT_SUGGESTIONS = [
  "¿Qué tratamientos hay para la hipertensión?",
  "¿Cómo debo tomar la amoxicilina?",
  "¿Cuáles son los efectos secundarios de la aspirina?",
  "¿Tienes productos para alergias estacionales?",
]

interface SuggestionsProps {
  suggestions?: string[]
  onClick: (suggestion: string) => void
}

export function Suggestions({ suggestions = DEFAULT_SUGGESTIONS, onClick }: SuggestionsProps) {
  return (
    <div className="p-2 border-t bg-muted/50">
      <p className="text-xs text-muted-foreground mb-2">Sugerencias:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-xs py-1 h-auto"
            onClick={() => onClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  )
} 
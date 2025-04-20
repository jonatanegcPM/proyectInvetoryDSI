import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Bot, Loader2, ThumbsDown, ThumbsUp, User } from "lucide-react"
import { Message } from "./types"

interface MessageItemProps {
  message: Message
  onFeedback: (messageId: string, feedback: "thumbs-up" | "thumbs-down") => void
}

export function MessageItem({ message, onFeedback }: MessageItemProps) {
  return (
    <div className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}>
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
              message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
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
                className={cn("h-6 w-6", message.feedback === "thumbs-up" && "text-green-500")}
                onClick={() => onFeedback(message.id, "thumbs-up")}
              >
                <ThumbsUp
                  className={cn("h-3 w-3", message.feedback === "thumbs-up" && "fill-current")}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-6 w-6", message.feedback === "thumbs-down" && "text-red-500")}
                onClick={() => onFeedback(message.id, "thumbs-down")}
              >
                <ThumbsDown
                  className={cn("h-3 w-3", message.feedback === "thumbs-down" && "fill-current")}
                />
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
  )
} 
import { Message } from "./types"
import { MessageItem } from "./message-item"
import { RefObject } from "react"

interface MessageListProps {
  messages: Message[]
  onFeedback: (messageId: string, feedback: "thumbs-up" | "thumbs-down") => void
  messagesEndRef: RefObject<HTMLDivElement | null>
}

export function MessageList({ messages, onFeedback, messagesEndRef }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 h-[calc(500px-120px)]">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageItem 
            key={message.id} 
            message={message} 
            onFeedback={onFeedback} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
} 
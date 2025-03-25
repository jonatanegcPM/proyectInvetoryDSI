"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { QuickActionProps } from "@/types/dashboard"

export function QuickAction({ icon, title, description, onClick }: QuickActionProps) {
  return (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onClick}>
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <div className="h-8 w-8 mb-2 text-primary">{icon}</div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}


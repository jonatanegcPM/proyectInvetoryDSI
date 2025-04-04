import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string
  description?: string
  icon: React.ReactNode
  isLoading?: boolean
  changeValue?: number
  changePeriodText?: string // Nueva prop para el texto del período
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  isLoading = false,
  changeValue,
  changePeriodText = "desde el mes pasado", // Valor por defecto
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-7 w-3/4 mb-1" />
            {description && <Skeleton className="h-4 w-1/2" />}
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {(description || changeValue !== undefined) && (
              <div className="flex items-center text-xs">
                {changeValue !== undefined && (
                  <div
                    className={cn(
                      "mr-1 font-medium",
                      changeValue === null
                        ? "text-gray-500"
                        : changeValue > 0
                          ? "text-green-600"
                          : changeValue < 0
                            ? "text-red-600"
                            : "text-gray-500",
                    )}
                  >
                    {changeValue !== null && changeValue > 0 && "+"}
                    {changeValue === null ? "0" : changeValue.toFixed(1)}%
                  </div>
                )}
                {changeValue !== undefined && <span className="text-muted-foreground mr-1">{changePeriodText}</span>}
                {description && <p className="text-muted-foreground">{description}</p>}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}


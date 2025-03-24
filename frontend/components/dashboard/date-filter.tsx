"use client"

import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import type { DateFilterProps } from "@/types/dashboard"

export function DateFilter({ dateFilter, setDateFilter }: DateFilterProps) {
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <Button variant={dateFilter === "today" ? "default" : "outline"} size="sm" onClick={() => setDateFilter("today")}>
        Hoy
      </Button>
      <Button variant={dateFilter === "week" ? "default" : "outline"} size="sm" onClick={() => setDateFilter("week")}>
        Esta Semana
      </Button>
      <Button variant={dateFilter === "month" ? "default" : "outline"} size="sm" onClick={() => setDateFilter("month")}>
        Este Mes
      </Button>
      {dateFilter !== "all" && (
        <Button variant="ghost" size="sm" onClick={() => setDateFilter("all")}>
          <Filter className="h-4 w-4" />
          <span className="sr-only">Limpiar filtros</span>
        </Button>
      )}
    </div>
  )
}


"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { SearchBarProps } from "@/types/dashboard"

export function SearchBar({ searchTerm, setSearchTerm, placeholder = "Buscar..." }: SearchBarProps) {
  return (
    <form className="w-full">
      <div className="relative w-full max-w-sm lg:max-w-lg">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className="w-full pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </form>
  )
}


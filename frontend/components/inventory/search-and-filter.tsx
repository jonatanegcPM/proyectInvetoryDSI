"use client"

import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExportMenu } from "./export-menu"
import type { Category } from "@/types/inventory"

interface SearchAndFilterProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCategory: string | null
  setSelectedCategory: (category: string | null) => void
  categories: Category[]
  onExportClick: (format: string) => void
  onAddProductClick: () => void
  isSubmitting: boolean
  noData?: boolean
}

export function SearchAndFilter({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  onExportClick,
  onAddProductClick,
  isSubmitting,
  noData = false,
}: SearchAndFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos, SKU, código de barras..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory || ""} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id || "all"} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <ExportMenu onExport={onExportClick} isSubmitting={isSubmitting} disabled={noData} />
        <Button size="sm" onClick={onAddProductClick}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>
    </div>
  )
}

"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown, User } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { CustomerSelectorProps } from "@/types/point-of-sale"

// Función para normalizar cadenas y eliminar acentos
const normalizeString = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

export function CustomerSelector({ selectedCustomer, onCustomerSelect, customers }: CustomerSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const filteredCustomers = useMemo(() => {
    if (!searchValue.trim()) {
      return customers
    }

    const normalizedSearch = normalizeString(searchValue)
    return customers.filter(
      (customer) =>
        normalizeString(customer.name).includes(normalizedSearch) ||
        normalizeString(customer.email).includes(normalizedSearch) ||
        normalizeString(customer.phone).includes(normalizedSearch),
    )
  }, [searchValue, customers])

  // Agregar log para depuración
  console.log("Término de búsqueda:", searchValue)
  console.log("Clientes filtrados:", filteredCustomers)
  console.log("Total clientes disponibles:", customers.length)

  return (
    <div className="w-full space-y-2">
      <Label htmlFor="customer-search">Cliente</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            id="customer-search"
          >
            {selectedCustomer ? (
              <div className="flex items-center gap-2 text-left">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{selectedCustomer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="truncate">{selectedCustomer.name}</span>
              </div>
            ) : (
              "Buscar cliente..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchValue}
              onValueChange={(value) => {
                setSearchValue(value);
                setOpen(true);
              }}
            />
            <CommandList>
              <CommandEmpty>
                {searchValue ? "No se encontraron clientes" : "Comience a escribir para buscar"}
              </CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {filteredCustomers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.name}
                    onSelect={() => {
                      onCustomerSelect(customer.id.toString())
                      setOpen(false)
                      setSearchValue("")
                    }}
                    className="flex items-center gap-2"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-sm">
                      <span>{customer.name}</span>
                      <span className="text-xs text-muted-foreground">{customer.email}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCustomer && (
        <div className="mt-2 rounded-md border p-3 bg-muted/40">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Información del cliente</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <span className="text-muted-foreground">Email:</span>
            <span>{selectedCustomer.email}</span>
            <span className="text-muted-foreground">Teléfono:</span>
            <span>{selectedCustomer.phone}</span>
          </div>
        </div>
      )}
    </div>
  )
}

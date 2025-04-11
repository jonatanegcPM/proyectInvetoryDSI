import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normaliza una cadena de texto para hacerla insensible a tildes y mayúsculas
 * @param str - La cadena de texto a normalizar
 * @returns La cadena normalizada
 */
export function normalizeSearchString(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

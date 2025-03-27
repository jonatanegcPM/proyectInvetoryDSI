"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Scan } from "lucide-react"
import type { ProductScannerProps } from "@/types/point-of-sale"

export function ProductScanner({ isScanning, scanMessage, scanError, toggleScanning }: ProductScannerProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Escáner de Productos</CardTitle>
        <Button
          onClick={toggleScanning}
          variant={isScanning ? "destructive" : "default"}
          className="flex items-center gap-2"
        >
          <Scan className="h-4 w-4" />
          {isScanning ? "Desactivar Escáner" : "Activar Escáner"}
        </Button>
      </CardHeader>
      <CardContent>
        {isScanning && (
          <div className="flex flex-col gap-4">
            <Badge variant="outline" className="w-fit py-2 px-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full bg-green-500 ${isScanning ? "animate-pulse" : ""}`}></div>
                {scanMessage}
              </div>
            </Badge>
            {scanError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{scanError}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
        {!isScanning && (
          <p className="text-sm text-muted-foreground">
            Active el escáner para agregar productos rápidamente usando un lector de código de barras.
          </p>
        )}
      </CardContent>
    </Card>
  )
}


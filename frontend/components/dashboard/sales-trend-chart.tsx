"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useTheme } from "next-themes"

interface SalesTrendData {
  date: string
  sales: number
  transactions: number
}

interface SalesTrendChartProps {
  data: SalesTrendData[] | undefined
  isLoading: boolean
  dateFilter: "day" | "week" | "month" | "year" | "all"
}

export function SalesTrendChart({ data, isLoading, dateFilter }: SalesTrendChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const textColor = isDark ? "#ffffff" : "#000000"
  const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"

  // Función para formatear el título según el filtro
  const getChartTitle = () => {
    switch (dateFilter) {
      case "day":
        return "Ventas de Hoy (Por Hora)"
      case "week":
        return "Ventas de la Semana"
      case "month":
        return "Ventas del Mes"
      case "year":
        return "Ventas del Año"
      case "all":
        return "Historial de Ventas"
      default:
        return "Tendencia de Ventas"
    }
  }

  // Asegurarse de que data no sea undefined
  const chartData = data || []

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{getChartTitle()}</CardTitle>
        <CardDescription className="text-xs">Tendencia de ventas y transacciones</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px] pt-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No hay datos disponibles para el período seleccionado
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: textColor }} tickMargin={10} stroke={textColor} />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: textColor }}
                tickFormatter={(value) => `$${value}`}
                stroke={textColor}
              />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: textColor }} stroke={textColor} />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "Monto Total de Venta ($)") return [`$${value}`, "Monto de las ventas"]
                  return [value, "Ventas"]
                }}
                labelFormatter={(label) => `Fecha: ${label}`}
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "6px",
                  color: textColor,
                }}
              />
              <Legend
                wrapperStyle={{ color: textColor }}
                formatter={(value) => <span style={{ color: textColor }}>{value}</span>}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sales"
                name="Monto Total de Venta ($)"
                stroke="#0ea5e9"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="transactions"
                name="Número de Ventas"
                stroke="#f97316"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}


"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts"
import { useTheme } from "next-themes"

interface TopSellingProduct {
  id: string
  name: string
  quantity: number
  totalSales: number
}

interface TopProductsChartProps {
  data: TopSellingProduct[] | undefined
  isLoading: boolean
}

export function TopProductsChart({ data, isLoading }: TopProductsChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const textColor = isDark ? "#ffffff" : "#000000"
  const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"

  // Preparar los datos para el gráfico, asegurándose de que data no sea undefined
  const chartData = data
    ? data.map((product) => ({
        name: product.name.length > 20 ? product.name.substring(0, 20) + "..." : product.name,
        fullName: product.name,
        quantity: product.quantity,
        sales: product.totalSales,
      }))
    : []

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Productos Más Vendidos</CardTitle>
        <CardDescription className="text-xs">Los productos con mayor volumen de ventas</CardDescription>
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
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" stroke={textColor} tick={{ fontSize: 12, fill: textColor }} />
              <YAxis
                dataKey="name"
                type="category"
                scale="band"
                tick={{ fontSize: 12, fill: textColor }}
                width={150}
                stroke={textColor}
              />
              <Tooltip
                formatter={(value, name, props) => {
                  if (name === "quantity") return [value, "Unidades vendidas"]
                  return [`${value}`, "Ventas totales"]
                }}
                labelFormatter={(label, props) => {
                  // Verificar si props existe y tiene elementos antes de acceder a payload
                  if (!props || !props.length || !props[0] || !props[0].payload) {
                    return label || "" // Devolver el label original o cadena vacía si no hay datos
                  }
                  return props[0].payload.fullName || label
                }}
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "6px",
                  color: textColor,
                }}
              />
              <Bar dataKey="quantity" name="Unidades vendidas" fill="#8884d8">
                <LabelList dataKey="quantity" position="right" fill={textColor} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}


import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/hooks/use-customers"
import type { CustomerPurchasesProps } from "@/types/customers"

export function CustomerPurchases({ purchases }: CustomerPurchasesProps) {
  return (
    <ScrollArea className="h-[300px] w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Artículos</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Método de Pago</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell className="font-medium">{purchase.id}</TableCell>
              <TableCell>{formatDate(purchase.date)}</TableCell>
              <TableCell>{purchase.items}</TableCell>
              <TableCell>${purchase.total.toFixed(2)}</TableCell>
              <TableCell>{purchase.paymentMethod}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}

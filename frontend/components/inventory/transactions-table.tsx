import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import type { InventoryTransaction } from "@/types/inventory"

interface TransactionsTableProps {
  transactions: InventoryTransaction[]
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Producto</TableHead>
          <TableHead>Cantidad</TableHead>
          <TableHead>Usuario</TableHead>
          <TableHead>Notas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8">
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="h-8 w-8 mb-2" />
                <p>No hay transacciones disponibles</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">#{transaction.id}</TableCell>
              <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    transaction.type === "Recepción"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : transaction.type === "Venta"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : transaction.type === "Ajuste"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                  }
                >
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell>{transaction.product}</TableCell>
              <TableCell className={transaction.quantity < 0 ? "text-red-600" : "text-green-600"}>
                {transaction.quantity > 0 ? `+${transaction.quantity}` : transaction.quantity}
              </TableCell>
              <TableCell>{transaction.user}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={transaction.notes}>
                {transaction.notes}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}


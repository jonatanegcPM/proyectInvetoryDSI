using Microsoft.EntityFrameworkCore;
using proyectInvetoryDSI.Data;
using proyectInvetoryDSI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace proyectInvetoryDSI.Services
{
    public class DashboardService
    {
        private readonly AppDbContext _context;

        public DashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetDashboardStats(string dateFilter = "month")
        {
            DateTime currentDate = DateTime.Now;
            DateTime? startDate = null;
            DateTime? endDate = null;

            switch (dateFilter.ToLower())
            {
                case "day":
                    startDate = currentDate.Date;
                    endDate = startDate.Value.AddDays(1).AddTicks(-1);
                    break;
                case "week":
                    int daysToSubtract = ((int)currentDate.DayOfWeek + 6) % 7;
                    startDate = currentDate.AddDays(-daysToSubtract); // Lunes
                    endDate = startDate.Value.AddDays(7).AddTicks(-1); // Domingo
                    break;
                case "month":
                    startDate = new DateTime(currentDate.Year, currentDate.Month, 1);
                    endDate = startDate.Value.AddMonths(1).AddTicks(-1);
                    break;
                case "year":
                    startDate = new DateTime(currentDate.Year, 1, 1);
                    endDate = startDate.Value.AddYears(1).AddTicks(-1);
                    break;
                case "all":
                    startDate = null;
                    endDate = null;
                    break;
                default:
                    startDate = currentDate.AddDays(-7);
                    endDate = currentDate.Date.AddDays(1).AddTicks(-1);
                    break;
            }

            // Obtener ventas en el período actual
            var currentSalesQuery = _context.Sales.AsQueryable();
            if (startDate.HasValue && endDate.HasValue)
            {
                currentSalesQuery = currentSalesQuery.Where(s => s.SaleDate >= startDate.Value && s.SaleDate <= endDate.Value);
            }
            var currentSales = await currentSalesQuery.ToListAsync();

            // Obtener ventas en el período anterior (excepto para "all")
            DateTime? previousStartDate = null;
            DateTime? previousEndDate = null;
            var previousSales = new List<Sale>(); // Lista vacía por defecto
            if (dateFilter.ToLower() != "all" && startDate.HasValue && endDate.HasValue)
            {
                switch (dateFilter.ToLower())
                {
                    case "day":
                        previousStartDate = startDate.Value.AddDays(-1);
                        previousEndDate = endDate.Value.AddDays(-1);
                        break;
                    case "week":
                    case "default":
                        previousStartDate = startDate.Value.AddDays(-7);
                        previousEndDate = endDate.Value.AddDays(-7);
                        break;
                    case "month":
                        previousStartDate = startDate.Value.AddMonths(-1);
                        previousEndDate = endDate.Value.AddMonths(-1);
                        break;
                    case "year":
                        previousStartDate = startDate.Value.AddYears(-1);
                        previousEndDate = endDate.Value.AddYears(-1);
                        break;
                }
                var previousSalesQuery = _context.Sales.AsQueryable();
                if (previousStartDate.HasValue && previousEndDate.HasValue)
                {
                    previousSalesQuery = previousSalesQuery.Where(s => s.SaleDate >= previousStartDate.Value && s.SaleDate <= previousEndDate.Value);
                }
                previousSales = await previousSalesQuery.ToListAsync();
            }

            decimal currentTotal = currentSales.Sum(s => s.TotalAmount);
            decimal previousTotal = previousSales.Sum(s => s.TotalAmount);
            decimal? salesChange = dateFilter.ToLower() != "all" && previousTotal != 0 ? (decimal?)Math.Round(((currentTotal - previousTotal) / previousTotal) * 100, 1) : null;

            int currentCount = currentSales.Count;
            int previousCount = previousSales.Count;
            decimal? transactionChange = dateFilter.ToLower() != "all" && previousCount != 0 ? (decimal?)Math.Round(((currentCount - previousCount) / (decimal)previousCount) * 100, 1) : null;

            var customerStats = await _context.Customers.CountAsync();
            int lowStockCount = await _context.Products
                .Where(p => p.ReorderLevel.HasValue &&
                           p.StockQuantity < p.ReorderLevel.Value &&
                           p.Status != "deleted")
                .CountAsync();

            return new
            {
                sales = new { total = currentTotal, change = salesChange, period = dateFilter },
                transactions = new { count = currentCount, change = transactionChange, period = dateFilter },
                customers = new { count = customerStats, change = 12.5, period = dateFilter }, // Asumo que este cambio sigue siendo fijo
                inventory = new { lowStock = lowStockCount }
            };
        }


        public async Task<object> GetRecentTransactions(string dateFilter = "week", int page = 1, int limit = 10)
        {
            DateTime? startDate = null;
            DateTime? endDate = null;

            switch (dateFilter.ToLower())
            {
                case "day":
                    startDate = DateTime.Now.Date;
                    endDate = startDate.Value.AddDays(1).AddTicks(-1); // Fin del día
                    break;
                case "week":
                    int daysToSubtract = ((int)DateTime.Now.DayOfWeek + 6) % 7;
                    startDate = DateTime.Now.Date.AddDays(-daysToSubtract); // Inicio de la semana (lunes)
                    endDate = startDate.Value.AddDays(7).AddTicks(-1); // Fin de la semana (domingo)
                    break;
                case "month":
                    startDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1); // Primer día del mes
                    endDate = startDate.Value.AddMonths(1).AddTicks(-1); // Fin del mes
                    break;
                case "year":
                    startDate = new DateTime(DateTime.Now.Year, 1, 1); // Inicio del año
                    endDate = startDate.Value.AddYears(1).AddTicks(-1); // Fin del año
                    break;
                case "all":
                    startDate = null; // Sin filtro de fecha
                    endDate = null;
                    break;
                default:
                    startDate = DateTime.Now.Date.AddDays(-7); // Última semana por defecto
                    endDate = DateTime.Now.Date.AddDays(1).AddTicks(-1); // Fin del día
                    break;
            }

            var query = _context.Sales
                .Include(s => s.Customer)
                .AsQueryable();

            if (startDate.HasValue && endDate.HasValue)
            {
                query = query.Where(s => s.SaleDate >= startDate.Value && s.SaleDate <= endDate.Value);
            }

            query = query.OrderByDescending(s => s.SaleDate);

            int totalCount = await query.CountAsync();

            var transactions = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(s => new
                {
                    id = $"TX-{s.SaleID}",
                    customer = s.Customer != null ? s.Customer.Name : "Cliente no disponible",
                    items = s.SaleDetails.Count,
                    amount = s.TotalAmount,
                    status = "completed",
                    date = s.SaleDate,
                    paymentMethod = s.PaymentMethod
                })
                .ToListAsync();

            return new
            {
                transactions,
                pagination = new
                {
                    total = totalCount,
                    page,
                    limit,
                    pages = (int)Math.Ceiling(totalCount / (double)limit)
                }
            };
        }


        public async Task<object?> GetTransactionDetails(int id)
        {
            var sale = await _context.Sales
                .Include(s => s.Customer)
                .Include(s => s.SaleDetails)
                    .ThenInclude(sd => sd.Product)
                .FirstOrDefaultAsync(s => s.SaleID == id);

            if (sale == null || sale.Customer == null)
            {
                return null;
            }

            var subtotal = sale.SaleDetails.Sum(sd => sd.UnitPrice * sd.Quantity);
            var tax = Math.Round(subtotal * 0.13m, 2); // Aplicar 13% de impuesto
            var total = subtotal + tax; // Calcular el total con impuesto

            return new
            {
                id = $"TX-{sale.SaleID}",
                customer = sale.Customer.Name,
                items = sale.SaleDetails.Count,
                amount = total,
                status = "completed",
                date = sale.SaleDate,
                products = sale.SaleDetails.Select(sd => new
                {
                    id = $"P{sd.Product?.ProductID.ToString().PadLeft(3, '0')}",
                    name = sd.Product?.Name ?? "Producto no disponible",
                    quantity = sd.Quantity,
                    unitPrice = sd.UnitPrice,
                    total = sd.UnitPrice * sd.Quantity
                }),
                subtotal,
                tax,
                paymentMethod = sale.PaymentMethod
            };
        }

        public async Task<object> GetLowStockProducts(int limit = 5, string threshold = "in-stock")
        {
            IQueryable<Product> query = _context.Products
                .Include(p => p.Category) // Incluir la relación con Category
                .Where(p => p.Status != "deleted"); // Excluir productos eliminados

            // Filtrar productos con stock bajo o crítico basado en ReorderLevel
            if (threshold.ToLower() == "in-stock")
            {
                query = query.Where(p => p.ReorderLevel.HasValue &&
                                       p.StockQuantity < p.ReorderLevel.Value * 0.5); // Stock menor al 50% del nivel de reorden
            }
            else
            {
                query = query.Where(p => p.ReorderLevel.HasValue &&
                                       p.StockQuantity < p.ReorderLevel.Value); // Stock menor al nivel de reorden
            }

            int totalCount = await query.CountAsync();

            var products = await query
                .OrderBy(p => p.StockQuantity) // Ordenar por stock ascendente para priorizar los más bajos
                .Take(limit)
                .Select(p => new
                {
                    id = $"P{p.ProductID.ToString().PadLeft(3, '0')}",
                    name = p.Name,
                    sku = $"MED-{p.ProductID.ToString().PadLeft(4, '0')}",
                    category = p.Category != null ? p.Category.CategoryName : "Sin categoría", // Usar la categoría del producto
                    currentStock = p.StockQuantity,
                    reorderLevel = p.ReorderLevel ?? 0, // Usar el nivel de reorden del producto
                    criticalLevel = p.ReorderLevel.HasValue ? p.ReorderLevel.Value * 0.5 : 0, // 50% del nivel de reorden
                    status = p.ReorderLevel.HasValue && p.StockQuantity <= p.ReorderLevel.Value * 0.5 ? "critical" :
                             p.ReorderLevel.HasValue && p.StockQuantity <= p.ReorderLevel.Value ? "low" : "normal"
                })
                .ToListAsync();

            return new
            {
                lowStockProducts = products,
                pagination = new
                {
                    total = totalCount,
                    returned = products.Count,
                    limit
                }
            };
        }

        public async Task<object> GetTopSellingProducts(string dateFilter = "month", int limit = 5)
        {
            DateTime currentDate = DateTime.Now;
            DateTime? startDate = null;
            DateTime? endDate = null;

            switch (dateFilter.ToLower())
            {
                case "day":
                    startDate = currentDate.Date;
                    endDate = startDate.Value.AddDays(1).AddTicks(-1);
                    break;
                case "week":
                    int daysToSubtract = ((int)currentDate.DayOfWeek + 6) % 7;
                    startDate = currentDate.Date.AddDays(-daysToSubtract); // Inicio de la semana (lunes)
                    endDate = startDate.Value.AddDays(7).AddTicks(-1); // Fin de la semana (domingo)
                    break;
                case "month":
                    startDate = new DateTime(currentDate.Year, currentDate.Month, 1);
                    endDate = startDate.Value.AddMonths(1).AddTicks(-1);
                    break;
                case "year":
                    startDate = new DateTime(currentDate.Year, 1, 1);
                    endDate = startDate.Value.AddYears(1).AddTicks(-1);
                    break;
                case "all":
                    startDate = null;
                    endDate = null;
                    break;
                default:
                    startDate = currentDate.AddDays(-7);
                    endDate = currentDate.Date.AddDays(1).AddTicks(-1);
                    break;
            }

            var query = _context.SaleDetails
                .Include(sd => sd.Product)
                .Include(sd => sd.Sale)
                .Where(sd => sd.Product != null && sd.Sale != null) // Verifica que no sean null
                .AsQueryable();

            if (startDate.HasValue && endDate.HasValue)
            {
                query = query.Where(sd => sd.Sale!.SaleDate >= startDate.Value &&
                                          sd.Sale.SaleDate <= endDate.Value);
            }

            var topProducts = await query
                .GroupBy(sd => new { ProductId = sd.Product!.ProductID, Name = sd.Product.Name }) // Producto no será null
                .Select(g => new
                {
                    productId = g.Key.ProductId,
                    name = g.Key.Name,
                    totalSold = g.Sum(sd => sd.Quantity),
                    totalRevenue = g.Sum(sd => sd.Quantity * sd.UnitPrice)
                })
                .OrderByDescending(p => p.totalSold)
                .Take(limit)
                .ToListAsync();

            return new { topSellingProducts = topProducts };
        }


    }
}
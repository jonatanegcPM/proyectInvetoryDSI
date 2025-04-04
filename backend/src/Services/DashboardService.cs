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

        public async Task<object> GetDashboardStats()
        {
            // Estadísticas de ventas
            var currentDate = DateTime.Now;
            var currentMonthStart = new DateTime(currentDate.Year, currentDate.Month, 1);
            var previousMonthStart = currentMonthStart.AddMonths(-1);
            
            var currentMonthSales = await _context.Sales
                .Where(s => s.SaleDate >= currentMonthStart && s.SaleDate < currentMonthStart.AddMonths(1))
                .ToListAsync();
            
            var previousMonthSales = await _context.Sales
                .Where(s => s.SaleDate >= previousMonthStart && s.SaleDate < currentMonthStart)
                .ToListAsync();

            decimal currentMonthTotal = currentMonthSales.Sum(s => s.TotalAmount);
            decimal previousMonthTotal = previousMonthSales.Sum(s => s.TotalAmount);
            decimal salesChange = previousMonthTotal != 0 ? 
                ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 : 0;

            // Estadísticas de transacciones
            int currentMonthCount = currentMonthSales.Count;
            int previousMonthCount = previousMonthSales.Count;
            decimal transactionChange = previousMonthCount != 0 ? 
                ((currentMonthCount - previousMonthCount) / (decimal)previousMonthCount) * 100 : 0;

            // Estadísticas de clientes
            var customerStats = await _context.Customers.CountAsync();

            // Productos con bajo stock
            int lowStockCount = await _context.Products
                .Where(p => p.StockQuantity < 10)
                .CountAsync();

            return new
            {
                sales = new
                {
                    total = currentMonthTotal,
                    change = Math.Round(salesChange, 1),
                    period = "month"
                },
                transactions = new
                {
                    count = currentMonthCount,
                    change = Math.Round(transactionChange, 1),
                    period = "month"
                },
                customers = new
                {
                    count = customerStats,
                    change = 12.5, // Este valor podría calcularse de manera similar a los anteriores
                    period = "month"
                },
                inventory = new
                {
                    lowStock = lowStockCount
                }
            };
        }

        public async Task<object> GetRecentTransactions(string dateFilter = "week", int page = 1, int limit = 10)
        {
            DateTime startDate = DateTime.UtcNow;

            switch (dateFilter.ToLower())
            {
                case "day":
                    startDate = startDate.AddDays(-1);
                    break;
                case "week":
                    startDate = startDate.AddDays(-7);
                    break;
                case "month":
                    startDate = startDate.AddMonths(-1);
                    break;
                case "year":
                    startDate = startDate.AddYears(-1);
                    break;
                default:
                    startDate = startDate.AddDays(-7);
                    break;
            }

            var query = _context.Sales
                .Include(s => s.Customer)
                .Where(s => s.SaleDate >= startDate)
                .OrderByDescending(s => s.SaleDate);

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
                    date = s.SaleDate
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
            var tax = sale.TotalAmount - subtotal;

            return new
            {
                id = $"TX-{sale.SaleID}",
                customer = sale.Customer.Name,
                items = sale.SaleDetails.Count,
                amount = sale.TotalAmount,
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
                tax
            };
        }

        public async Task<object> GetLowStockProducts(int limit = 5, string threshold = "critical")
        {
            IQueryable<Product> query = _context.Products;

            if (threshold.ToLower() == "critical")
            {
                query = query.Where(p => p.StockQuantity < 10); // Nivel crítico
            }
            else
            {
                query = query.Where(p => p.StockQuantity < 20); // Nivel de reorden
            }

            int totalCount = await query.CountAsync();

            var products = await query
                .OrderBy(p => p.StockQuantity)
                .Take(limit)
                .Select(p => new
                {
                    id = $"P{p.ProductID.ToString().PadLeft(3, '0')}",
                    name = p.Name,
                    sku = $"MED-{p.ProductID.ToString().PadLeft(4, '0')}",
                    category = "Medicamentos",
                    currentStock = p.StockQuantity,
                    reorderLevel = 20,
                    criticalLevel = 10,
                    status = p.StockQuantity < 10 ? "critical" : "low"
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
    }
}
using Microsoft.EntityFrameworkCore;
using proyectInvetoryDSI.Data;
using proyectInvetoryDSI.Models;
using proyectInvetoryDSI.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace proyectInvetoryDSI.Services
{
    public class PosService : IPosService
    {
        private readonly AppDbContext _context;
        private const decimal TaxRate = 0.13m; // 13% de impuestos
        private const decimal Tolerance = 0.01m; // Margen de tolerancia para comparaciones decimales
        private static readonly TimeZoneInfo ElSalvadorTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Central America Standard Time");

        public PosService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ProductResponse> GetProducts(string search, int page, int limit)
        {
            try
            {
                page = Math.Max(1, page);
                limit = Math.Clamp(limit, 1, 100);

                var query = _context.Products
                    .Where(p => p.Status != "deleted") // Excluir productos eliminados
                    .AsNoTracking()
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    search = search.Trim().ToLower();
                    query = query.Where(p =>
                        p.Name.ToLower().Contains(search) ||
                        (p.Description != null && p.Description.ToLower().Contains(search)) ||
                        (p.Barcode != null && p.Barcode.ToLower().Contains(search)));
                }

                var totalItems = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalItems / (double)limit);

                var products = await query
                    .OrderBy(p => p.Name)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .Select(p => new ProductDTO
                    {
                        Id = p.ProductID,
                        Name = p.Name,
                        Price = Math.Round(p.Price, 2),
                        Description = p.Description,
                        Barcode = p.Barcode,
                        Stock = p.StockQuantity,
                        ReorderLevel = p.ReorderLevel
                    })
                    .ToListAsync();

                return new ProductResponse
                {
                    Products = products,
                    Pagination = new Pagination
                    {
                        Total = totalItems,
                        Page = page,
                        Limit = limit,
                        Pages = totalPages
                    }
                };
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Error al obtener productos", ex);
            }
        }

        public async Task<ProductDTO?> GetProductByBarcode(string barcode)
        {
            if (string.IsNullOrWhiteSpace(barcode))
                return null;

            try
            {
                var product = await _context.Products
                    .AsNoTracking()
                    .Where(p => p.Barcode == barcode && p.Status != "deleted") // Excluir productos eliminados
                    .Select(p => new ProductDTO
                    {
                        Id = p.ProductID,
                        Name = p.Name,
                        Price = Math.Round(p.Price, 2),
                        Description = p.Description,
                        Barcode = p.Barcode,
                        Stock = p.StockQuantity,
                        ReorderLevel = p.ReorderLevel
                    })
                    .FirstOrDefaultAsync();

                return product;
            }
            catch (Exception ex)
            {
                throw new ApplicationException($"Error al buscar producto con código {barcode}", ex);
            }
        }

        public async Task<CustomersResponse> GetCustomers()
        {
            try
            {
                var customers = await _context.Customers
                    .AsNoTracking()
                    .OrderBy(c => c.Name)
                    .Select(c => new CustomerDTO
                    {
                        Id = c.CustomerID,
                        Name = c.Name,
                        Email = c.Email,
                        Phone = c.Phone
                    })
                    .ToListAsync();

                return new CustomersResponse { Customers = customers };
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Error al obtener clientes", ex);
            }
        }

        public async Task<SaleResponseDTO> CreateSale(CreateSaleDTO saleDto, int userId)
        {
            ValidateSaleRequest(saleDto);

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Verificar existencia de cliente
                if (!await _context.Customers.AnyAsync(c => c.CustomerID == saleDto.CustomerId))
                    throw new KeyNotFoundException($"Cliente con ID {saleDto.CustomerId} no encontrado");

                var sale = await ProcessSale(saleDto, userId);
                var saleDetails = await ProcessSaleItems(saleDto, sale.SaleID, userId);

                var (subtotal, tax, total) = CalculateTotals(saleDto, saleDetails);

                ValidateTotals(saleDto, subtotal, tax, total);

                // Actualizar el total de la venta
                sale.TotalAmount = total;
                _context.Sales.Update(sale);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                var customer = await _context.Customers.FindAsync(sale.CustomerID) ??
                    throw new KeyNotFoundException($"Cliente con ID {sale.CustomerID} no encontrado");
                return BuildSaleResponse(sale, saleDetails, subtotal, tax, total, saleDto.PaymentMethod, customer);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private void ValidateSaleRequest(CreateSaleDTO saleDto)
        {
            if (saleDto == null || saleDto.Items == null || !saleDto.Items.Any())
                throw new ArgumentException("La solicitud de venta no contiene items");

            if (saleDto.Items.Any(i => i.Quantity <= 0))
                throw new ArgumentException("Las cantidades deben ser mayores a cero");
        }

        private async Task<Sale> ProcessSale(CreateSaleDTO saleDto, int userId)
        {
            var utcNow = DateTime.UtcNow;
            var localTime = TimeZoneInfo.ConvertTimeFromUtc(utcNow, ElSalvadorTimeZone);

            var sale = new Sale
            {
                SaleDate = localTime,
                CustomerID = saleDto.CustomerId,
                TotalAmount = saleDto.Total,
                UserID = userId
            };

            _context.Sales.Add(sale);
            await _context.SaveChangesAsync();
            return sale;
        }

        private async Task<List<SaleDetail>> ProcessSaleItems(CreateSaleDTO saleDto, int saleId, int userId)
        {
            var saleDetails = new List<SaleDetail>();

            foreach (var item in saleDto.Items)
            {
                var product = await _context.Products.FindAsync(item.ProductId) ??
                    throw new KeyNotFoundException($"Producto con ID {item.ProductId} no encontrado");

                if (product.StockQuantity < item.Quantity)
                    throw new InvalidOperationException($"Stock insuficiente para el producto {product.Name}");

                var previousStock = product.StockQuantity;
                // Actualizar stock
                product.StockQuantity -= item.Quantity;
                _context.Products.Update(product);

                // Registrar transacción de inventario
                var transaction = new InventoryTransaction
                {
                    ProductID = item.ProductId,
                    TransactionType = "Venta",
                    Quantity = -item.Quantity, // Negativo porque es una salida de inventario
                    PreviousStock = previousStock,
                    NewStock = product.StockQuantity,
                    TransactionDate = DateTime.UtcNow,
                    UserID = userId, // Usar el userId que viene del parámetro del método CreateSale
                    Notes = $"Venta #{saleId}"
                };
                await _context.InventoryTransactions.AddAsync(transaction);

                // Crear detalle de venta usando el precio de la base de datos
                var itemSubtotal = Math.Round(product.Price * item.Quantity, 2);
                var saleDetail = new SaleDetail
                {
                    SaleID = saleId,
                    ProductID = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = Math.Round(product.Price, 2),
                    Subtotal = itemSubtotal
                };

                saleDetails.Add(saleDetail);
            }

            await _context.SaleDetails.AddRangeAsync(saleDetails);
            await _context.SaveChangesAsync();

            return saleDetails;
        }

        private (decimal subtotal, decimal tax, decimal total) CalculateTotals(CreateSaleDTO saleDto, List<SaleDetail> saleDetails)
        {
            var subtotal = Math.Round(saleDetails.Sum(sd => sd.Subtotal), 2);
            var tax = Math.Round(subtotal * TaxRate, 2);
            var total = Math.Round(subtotal + tax, 2);

            return (subtotal, tax, total);
        }

        private void ValidateTotals(CreateSaleDTO saleDto, decimal subtotal, decimal tax, decimal total)
        {
            if (Math.Abs(total - saleDto.Total) > Tolerance)
                throw new InvalidOperationException(
                    $"El total calculado ({total}) no coincide con el total enviado ({saleDto.Total})");
        }

        private SaleResponseDTO BuildSaleResponse(Sale sale, List<SaleDetail> saleDetails,
            decimal subtotal, decimal tax, decimal total, string paymentMethod, Customer customer)
        {
            var saleIdFormatted = $"S-{sale.SaleID:D5}";

            return new SaleResponseDTO
            {
                Id = saleIdFormatted,
                Date = sale.SaleDate,
                CustomerId = sale.CustomerID,
                Customer = new CustomerDTO
                {
                    Id = customer.CustomerID,
                    Name = customer.Name,
                    Email = customer.Email,
                    Phone = customer.Phone
                },
                Items = saleDetails.Select(sd => new SaleItemDTO
                {
                    ProductId = sd.ProductID,
                    Name = _context.Products.Find(sd.ProductID)?.Name ?? "Producto desconocido",
                    Quantity = sd.Quantity,
                    Price = sd.UnitPrice,
                    Total = sd.Subtotal
                }).ToList(),
                Subtotal = subtotal,
                Tax = tax,
                Total = total,
                PaymentMethod = paymentMethod
            };
        }

        public async Task<List<object>> GetRecentSalesAsync(int limit)
        {
            limit = Math.Clamp(limit, 1, 10); // Limitar entre 1 y 10 ventas

            var recentSales = await _context.Sales
                .Include(s => s.SaleDetails)
                .ThenInclude(sd => sd.Product)
                .OrderByDescending(s => s.SaleDate)
                .Take(limit)
                .Select(s => new
                {
                    date = s.SaleDate,
                    total = s.TotalAmount,
                    items = s.SaleDetails.Select(sd => new
                    {
                        name = sd.Product != null ? sd.Product.Name : "Producto desconocido",
                        quantity = sd.Quantity,
                        price = sd.UnitPrice
                    }).ToList()
                })
                .ToListAsync();

            return recentSales.Cast<object>().ToList();
        }
    }
}
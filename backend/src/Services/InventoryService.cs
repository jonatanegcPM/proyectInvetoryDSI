using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using proyectInvetoryDSI.Data;
using proyectInvetoryDSI.DTOs;
using proyectInvetoryDSI.Models;
using System.Security.Claims;
using System.Linq.Dynamic.Core;

namespace proyectInvetoryDSI.Services
{
    public interface IInventoryService
    {
        Task<ProductResponse> GetProductsAsync(string? search, int? categoryId, int page, int limit, string? sort, string? direction);
        Task<ProductDTO?> GetProductByIdAsync(int id);
        Task<ProductDTO> CreateProductAsync(CreateProductDTO createProductDto);
        Task UpdateProductAsync(int id, UpdateProductDTO updateProductDto);
        Task DeleteProductAsync(int id);
        Task<object> AdjustStockAsync(int id, AdjustStockDTO adjustStockDto);
        Task<object> GetTransactionsAsync(int page, int limit, int? productId, string? type, DateTime? startDate, DateTime? endDate);
        Task<IEnumerable<string>> GetCategoriesAsync();
        Task<InventoryStatsDTO> GetInventoryStatsAsync();
    }

    public class InventoryService : IInventoryService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public InventoryService(
            AppDbContext context, 
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                throw new UnauthorizedAccessException("Usuario no autenticado");
            }
            return userId;
        }

        public async Task<ProductResponse> GetProductsAsync(
            string? search, 
            int? categoryId, 
            int page, 
            int limit, 
            string? sort, 
            string? direction)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Where(p => p.Status != "deleted")
                .AsQueryable();

            // Aplicar filtros
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => 
                    p.Name.Contains(search) || 
                    (p.Description != null && p.Description.Contains(search)) || 
                    (p.SKU != null && p.SKU.Contains(search)) || 
                    (p.Barcode != null && p.Barcode.Contains(search)));
            }

            if (categoryId.HasValue && categoryId > 0)
            {
                query = query.Where(p => p.CategoryID == categoryId);
            }

            // Contar total antes de paginación
            var total = await query.CountAsync();

            // Aplicar ordenamiento
            if (!string.IsNullOrEmpty(sort))
            {
                var sortDirection = direction == "desc" ? "descending" : "ascending";
                query = query.OrderBy($"{sort} {sortDirection}");
            }
            else
            {
                query = query.OrderBy(p => p.Name);
            }

            // Aplicar paginación
            var products = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(p => new ProductDTO
                {
                    Id = p.ProductID,
                    Name = p.Name,
                    SKU = p.SKU,
                    Barcode = p.Barcode,
                    CategoryId = p.CategoryID,
                    Category = p.Category != null ? p.Category.CategoryName : null,
                    Description = p.Description,
                    Stock = p.StockQuantity,
                    ReorderLevel = p.ReorderLevel,
                    Price = p.Price,
                    CostPrice = p.CostPrice,
                    SupplierId = p.SupplierID,
                    Supplier = p.Supplier != null ? p.Supplier.Name : null,
                    ExpiryDate = p.ExpirationDate,
                    Location = p.Location,
                    Status = p.Status,
                    CreatedAt = p.CreatedAt,
                    LastUpdated = p.LastUpdated
                })
                .AsNoTracking()
                .ToListAsync();

            return new ProductResponse
            {
                Products = products,
                Pagination = new Pagination
                {
                    Total = total,
                    Page = page,
                    Limit = limit,
                    Pages = (int)Math.Ceiling(total / (double)limit)
                }
            };
        }

        public async Task<ProductDTO?> GetProductByIdAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Where(p => p.ProductID == id && p.Status != "deleted")
                .Select(p => new ProductDTO
                {
                    Id = p.ProductID,
                    Name = p.Name,
                    SKU = p.SKU,
                    Barcode = p.Barcode,
                    CategoryId = p.CategoryID,
                    Category = p.Category != null ? p.Category.CategoryName : null,
                    Description = p.Description,
                    Stock = p.StockQuantity,
                    ReorderLevel = p.ReorderLevel,
                    Price = p.Price,
                    CostPrice = p.CostPrice,
                    SupplierId = p.SupplierID,
                    Supplier = p.Supplier != null ? p.Supplier.Name : null,
                    ExpiryDate = p.ExpirationDate,
                    Location = p.Location,
                    Status = p.Status,
                    CreatedAt = p.CreatedAt,
                    LastUpdated = p.LastUpdated
                })
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }

        public async Task<ProductDTO> CreateProductAsync(CreateProductDTO createProductDto)
        {
            var currentUserId = GetCurrentUserId();

            var product = new Product
            {
                Name = createProductDto.Name,
                SKU = createProductDto.SKU,
                Barcode = createProductDto.Barcode,
                CategoryID = createProductDto.CategoryId,
                Description = createProductDto.Description,
                StockQuantity = createProductDto.Stock,
                ReorderLevel = createProductDto.ReorderLevel,
                Price = createProductDto.Price,
                CostPrice = createProductDto.CostPrice,
                SupplierID = createProductDto.SupplierId,
                ExpirationDate = createProductDto.ExpiryDate,
                Location = createProductDto.Location,
                Status = "in-stock",
                CreatedAt = DateTime.UtcNow,
                LastUpdated = DateTime.UtcNow,
                CreatedBy = currentUserId
            };

            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();

            // Crear registro de inventario
            var inventory = new Inventory
            {
                ProductID = product.ProductID,
                Quantity = product.StockQuantity,
                LastUpdated = DateTime.UtcNow
            };
            await _context.Inventories.AddAsync(inventory);

            // Crear transacción inicial de inventario
            var transaction = new InventoryTransaction
            {
                ProductID = product.ProductID,
                TransactionType = "Initial Stock",
                Quantity = product.StockQuantity,
                PreviousStock = 0,
                NewStock = product.StockQuantity,
                TransactionDate = DateTime.UtcNow,
                UserID = currentUserId,
                Notes = "Initial stock creation"
            };
            await _context.InventoryTransactions.AddAsync(transaction);

            await _context.SaveChangesAsync();

            // Obtener el producto con relaciones para la respuesta
            return await GetProductByIdAsync(product.ProductID) ?? throw new Exception("Error al recuperar el producto recién creado");
        }

        public async Task UpdateProductAsync(int id, UpdateProductDTO updateProductDto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null || product.Status == "deleted")
            {
                throw new KeyNotFoundException("Product not found");
            }

            product.Name = updateProductDto.Name;
            product.SKU = updateProductDto.SKU;
            product.Barcode = updateProductDto.Barcode;
            product.CategoryID = updateProductDto.CategoryId;
            product.Description = updateProductDto.Description;
            product.ReorderLevel = updateProductDto.ReorderLevel;
            product.Price = updateProductDto.Price;
            product.CostPrice = updateProductDto.CostPrice;
            product.SupplierID = updateProductDto.SupplierId;
            product.ExpirationDate = updateProductDto.ExpiryDate;
            product.Location = updateProductDto.Location;
            product.LastUpdated = DateTime.UtcNow;

            _context.Products.Update(product);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null || product.Status == "deleted")
            {
                throw new KeyNotFoundException("Product not found");
            }

            product.Status = "deleted";
            product.LastUpdated = DateTime.UtcNow;

            _context.Products.Update(product);
            await _context.SaveChangesAsync();
        }

        public async Task<object> AdjustStockAsync(int id, AdjustStockDTO adjustStockDto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null || product.Status == "deleted")
            {
                throw new KeyNotFoundException("Product not found");
            }

            var previousStock = product.StockQuantity;
            var newStock = previousStock + adjustStockDto.Quantity;

            if (newStock < 0)
            {
                throw new InvalidOperationException("Stock cannot be negative");
            }

            var currentUserId = GetCurrentUserId();

            // Actualizar stock del producto
            product.StockQuantity = newStock;
            product.LastUpdated = DateTime.UtcNow;
            _context.Products.Update(product);

            // Actualizar inventario
            var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.ProductID == id);
            if (inventory != null)
            {
                inventory.Quantity = newStock;
                inventory.LastUpdated = DateTime.UtcNow;
                _context.Inventories.Update(inventory);
            }
            else
            {
                inventory = new Inventory
                {
                    ProductID = id,
                    Quantity = newStock,
                    LastUpdated = DateTime.UtcNow
                };
                await _context.Inventories.AddAsync(inventory);
            }

            // Crear registro de transacción
            var transaction = new InventoryTransaction
            {
                ProductID = id,
                TransactionType = adjustStockDto.Type,
                Quantity = adjustStockDto.Quantity,
                PreviousStock = previousStock,
                NewStock = newStock,
                TransactionDate = DateTime.UtcNow,
                UserID = currentUserId,
                Notes = adjustStockDto.Notes
            };
            await _context.InventoryTransactions.AddAsync(transaction);

            await _context.SaveChangesAsync();

            return new
            {
                Id = id,
                PreviousStock = previousStock,
                NewStock = newStock,
                Adjustment = adjustStockDto.Quantity,
                Type = adjustStockDto.Type,
                Date = DateTime.UtcNow,
                Notes = adjustStockDto.Notes,
                ProductName = product.Name
            };
        }

        public async Task<object> GetTransactionsAsync(
            int page, 
            int limit, 
            int? productId, 
            string? type, 
            DateTime? startDate, 
            DateTime? endDate)
        {
            var query = _context.InventoryTransactions
                .Include(t => t.Product)
                .Include(t => t.User)
                .OrderByDescending(t => t.TransactionDate)
                .AsQueryable();

            // Aplicar filtros
            if (productId.HasValue)
            {
                query = query.Where(t => t.ProductID == productId);
            }

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(t => t.TransactionType == type);
            }

            if (startDate.HasValue)
            {
                query = query.Where(t => t.TransactionDate >= startDate.Value.Date);
            }

            if (endDate.HasValue)
            {
                query = query.Where(t => t.TransactionDate <= endDate.Value.Date.AddDays(1));
            }

            // Contar total antes de paginación
            var total = await query.CountAsync();

            // Aplicar paginación
            var transactions = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(t => new InventoryTransactionDTO
                {
                    Id = t.TransactionID,
                    Date = t.TransactionDate,
                    Type = t.TransactionType,
                    ProductId = t.ProductID,
                    ProductName = t.Product != null ? t.Product.Name : "Producto desconocido",
                    Quantity = t.Quantity,
                    Notes = t.Notes,
                    UserName = t.User != null ? t.User.Name : "Usuario desconocido"
                })
                .AsNoTracking()
                .ToListAsync();

            return new
            {
                Transactions = transactions,
                Pagination = new Pagination
                {
                    Total = total,
                    Page = page,
                    Limit = limit,
                    Pages = (int)Math.Ceiling(total / (double)limit)
                }
            };
        }

        public async Task<IEnumerable<string>> GetCategoriesAsync()
        {
            var categories = await _context.Categories
                .Where(c => c.IsActive)
                .OrderBy(c => c.CategoryName)
                .Select(c => c.CategoryName)
                .AsNoTracking()
                .ToListAsync();

            categories.Insert(0, "Todos");

            return categories;
        }

        public async Task<InventoryStatsDTO> GetInventoryStatsAsync()
        {
            var totalProducts = await _context.Products
                .Where(p => p.Status != "deleted")
                .CountAsync();
            
            var lowStockProducts = await _context.Products
                .Where(p => p.ReorderLevel.HasValue && 
                           p.StockQuantity <= p.ReorderLevel.Value && 
                           p.Status != "deleted")
                .CountAsync();
            
            var totalValue = await _context.Products
                .Where(p => p.Status != "deleted")
                .SumAsync(p => p.StockQuantity * (p.CostPrice ?? p.Price * 0.7m));

            var expiringProducts = await _context.Products
                .Where(p => p.ExpirationDate.HasValue && 
                           p.ExpirationDate.Value <= DateTime.UtcNow.AddMonths(3) && 
                           p.Status != "deleted")
                .CountAsync();

            return new InventoryStatsDTO
            {
                TotalProducts = totalProducts,
                LowStockProducts = lowStockProducts,
                TotalValue = totalValue,
                ExpiringProducts = expiringProducts
            };
        }
    }
}
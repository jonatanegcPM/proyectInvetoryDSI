using Microsoft.EntityFrameworkCore;
using proyectInvetoryDSI.Data;
using proyectInvetoryDSI.Models;
using proyectInvetoryDSI.DTOs;
using System.Linq.Dynamic.Core;
using System.Globalization;

namespace proyectInvetoryDSI.Services
{
    public class SupplierService
    {
        private readonly AppDbContext _context;

        public SupplierService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<SuppliersResponse> GetAllSuppliersAsync(
            string? search, 
            string? category, 
            int page = 1, 
            int limit = 10)
        {
            IQueryable<Supplier> query = _context.Suppliers
                .Include(s => s.Products)
                .Include(s => s.Purchases!)
                .AsQueryable();

            // Apply search filter
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(s => 
                    s.Name.Contains(search) || 
                    s.Contact.Contains(search) || 
                    s.Email.Contains(search));
            }

            // Apply category filter
            if (!string.IsNullOrEmpty(category) && category != "Todos")
            {
                query = query.Where(s => s.Category == category);
            }

            // Get total count before pagination
            int total = await query.CountAsync();

            // Apply pagination
            query = query.Skip((page - 1) * limit).Take(limit);

            var suppliers = await query.Select(s => new SupplierDTO
            {
                Id = s.SupplierID,
                Name = s.Name,
                Contact = s.Contact,
                Email = s.Email,
                Phone = s.Phone,
                Address = s.Address,
                Status = s.Status,
                Category = s.Category,
                Products = s.Products != null ? s.Products.Count : 0,
                LastOrder = s.Purchases != null && s.Purchases.Any() ? 
                    s.Purchases.Max(p => p.PurchaseDate).ToString("yyyy-MM-dd") : null
            }).ToListAsync();

            return new SuppliersResponse
            {
                Suppliers = suppliers,
                Pagination = new PaginationDTO
                {
                    Total = total,
                    Page = page,
                    Limit = limit,
                    Pages = (int)Math.Ceiling(total / (double)limit)
                }
            };
        }

        public async Task<SupplierDetailDTO?> GetSupplierByIdAsync(int id)
        {
            var supplier = await _context.Suppliers
                .Include(s => s.Products!.Where(p => p.Status != "deleted"))
                    .ThenInclude(p => p.Category)
                .Include(s => s.Purchases!)
                    .ThenInclude(p => p.PurchaseDetails)
                .FirstOrDefaultAsync(s => s.SupplierID == id);

            if (supplier == null)
            {
                return null;
            }

            var products = supplier.Products?.Select(p => new SupplierProductDTO
            {
                Id = p.ProductID,
                Name = p.Name,
                Category = p.Category != null ? p.Category.CategoryName : "Sin categoría",
                Stock = p.StockQuantity,
                Price = p.CostPrice ?? 0
            }).ToList() ?? new List<SupplierProductDTO>();

            var orders = supplier.Purchases?.Select(p => new SupplierOrderDTO
            {
                Id = $"ORD-{p.PurchaseID}",
                Date = p.PurchaseDate.ToString("yyyy-MM-dd"),
                Items = p.PurchaseDetails != null ? p.PurchaseDetails.Count : 0,
                Total = p.TotalAmount,
                Status = p.Status
            }).ToList() ?? new List<SupplierOrderDTO>();

            return new SupplierDetailDTO
            {
                Supplier = new SupplierDTO
                {
                    Id = supplier.SupplierID,
                    Name = supplier.Name,
                    Contact = supplier.Contact,
                    Email = supplier.Email,
                    Phone = supplier.Phone,
                    Address = supplier.Address,
                    Status = supplier.Status,
                    Category = supplier.Category,
                    Products = supplier.Products != null ? supplier.Products.Count : 0,
                    LastOrder = supplier.Purchases != null && supplier.Purchases.Any() ? 
                        supplier.Purchases.Max(p => p.PurchaseDate).ToString("yyyy-MM-dd") : null
                },
                Products = products,
                Orders = orders
            };
        }

        public async Task<SupplierDTO> CreateSupplierAsync(SupplierCreateDTO supplierDto)
        {
            var supplier = new Supplier
            {
                Name = supplierDto.Name,
                Contact = supplierDto.Contact,
                Email = supplierDto.Email,
                Phone = supplierDto.Phone,
                Address = supplierDto.Address,
                Category = supplierDto.Category,
                Status = supplierDto.Status
            };

            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();

            return new SupplierDTO
            {
                Id = supplier.SupplierID,
                Name = supplier.Name,
                Contact = supplier.Contact,
                Email = supplier.Email,
                Phone = supplier.Phone,
                Address = supplier.Address,
                Status = supplier.Status,
                Category = supplier.Category,
                Products = 0,
                LastOrder = null
            };
        }

        public async Task<SupplierDTO?> UpdateSupplierAsync(int id, SupplierCreateDTO supplierDto)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null)
            {
                return null;
            }

            supplier.Name = supplierDto.Name;
            supplier.Contact = supplierDto.Contact;
            supplier.Email = supplierDto.Email;
            supplier.Phone = supplierDto.Phone;
            supplier.Address = supplierDto.Address;
            supplier.Category = supplierDto.Category;
            supplier.Status = supplierDto.Status;

            _context.Suppliers.Update(supplier);
            await _context.SaveChangesAsync();

            // Get updated supplier with related data
            var updatedSupplier = await GetSupplierByIdAsync(id);
            return updatedSupplier?.Supplier;
        }

        public async Task<bool> DeleteSupplierAsync(int id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null)
            {
                return false;
            }

            _context.Suppliers.Remove(supplier);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<SupplierProductsResponse> GetSupplierProductsAsync(int id, int page = 1, int limit = 10)
        {
            var query = _context.Products
                .Where(p => p.SupplierID == id && p.Status != "deleted")
                .Include(p => p.Category)
                .OrderBy(p => p.Name);

            int total = await query.CountAsync();

            var products = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(p => new SupplierProductDTO
                {
                    Id = p.ProductID,
                    Name = p.Name,
                    Category = p.Category != null ? p.Category.CategoryName : "Sin categoría",
                    Stock = p.StockQuantity,
                    Price = p.CostPrice ?? 0
                })
                .ToListAsync();

            return new SupplierProductsResponse
            {
                Products = products,
                Pagination = new PaginationDTO
                {
                    Total = total,
                    Page = page,
                    Limit = limit,
                    Pages = (int)Math.Ceiling(total / (double)limit)
                }
            };
        }

        public async Task<SupplierOrdersResponse> GetSupplierOrdersAsync(int id, int page = 1, int limit = 10)
        {
            var query = _context.Purchases
                .Where(p => p.SupplierID == id)
                .Include(p => p.PurchaseDetails)
                .OrderByDescending(p => p.PurchaseDate);

            int total = await query.CountAsync();

            var orders = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(p => new SupplierOrderDTO
                {
                    Id = $"ORD-{p.PurchaseID}",
                    Date = p.PurchaseDate.ToString("yyyy-MM-dd"),
                    Items = p.PurchaseDetails != null ? p.PurchaseDetails.Count : 0,
                    Total = p.TotalAmount,
                    Status = "Recibido"
                })
                .ToListAsync();

            return new SupplierOrdersResponse
            {
                Orders = orders,
                Pagination = new PaginationDTO
                {
                    Total = total,
                    Page = page,
                    Limit = limit,
                    Pages = (int)Math.Ceiling(total / (double)limit)
                }
            };
        }

        public async Task<SupplierCategoriesResponse> GetSupplierCategoriesAsync()
        {
            var categories = await _context.Suppliers
                .Select(s => s.Category)
                .Distinct()
                .ToListAsync();

            // Agregar "Todos" como primera opción
            categories.Insert(0, "Todos");

            return new SupplierCategoriesResponse
            {
                Categories = categories
            };
        }

        public async Task<SupplierStatsDTO> GetSupplierStatsAsync()
        {
            var lastOrderDate = await _context.Purchases
                .OrderByDescending(p => p.PurchaseDate)
                .Select(p => p.PurchaseDate)
                .FirstOrDefaultAsync();

            return new SupplierStatsDTO
            {
                Total = await _context.Suppliers.CountAsync(),
                Active = await _context.Suppliers.CountAsync(s => s.Status == "active"),
                Products = await _context.Products.CountAsync(),
                LastOrderDate = lastOrderDate != default ? lastOrderDate.ToString("yyyy-MM-dd") : null
            };
        }
    }
}
using Microsoft.EntityFrameworkCore;
using proyectInvetoryDSI.Data;
using proyectInvetoryDSI.Models;
using proyectInvetoryDSI.DTOs;
using System.Security.Claims;

namespace proyectInvetoryDSI.Services
{
    public class PurchaseService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private const decimal TaxRate = 0.13m; // 13% de impuestos
        private readonly IEventNotificationService _eventNotificationService; // Nuevo servicio

        public PurchaseService(AppDbContext context, IHttpContextAccessor httpContextAccessor, IEventNotificationService eventNotificationService)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _eventNotificationService = eventNotificationService;
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

        public async Task<PurchaseResponseDTO> CreatePurchaseAsync(CreatePurchaseDTO purchaseDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Verificar que el proveedor existe
                var supplier = await _context.Suppliers.FindAsync(purchaseDto.SupplierId)
                    ?? throw new KeyNotFoundException($"Proveedor con ID {purchaseDto.SupplierId} no encontrado");

                // Crear la compra
                var purchase = new Purchase
                {
                    PurchaseDate = DateTime.UtcNow,
                    ExpectedDeliveryDate = purchaseDto.ExpectedDeliveryDate,
                    SupplierID = purchaseDto.SupplierId,
                    UserID = GetCurrentUserId(),
                    TotalAmount = 0, // Se actualizará después de procesar los items
                    Status = "pending",
                    Notes = purchaseDto.Notes
                };

                _context.Purchases.Add(purchase);
                await _context.SaveChangesAsync();

                // Procesar los items de la compra
                var purchaseDetails = new List<PurchaseDetail>();
                decimal subtotal = 0;

                foreach (var item in purchaseDto.Items)
                {
                    // Verificar que el producto existe
                    var product = await _context.Products.FindAsync(item.ProductId)
                        ?? throw new KeyNotFoundException($"Producto con ID {item.ProductId} no encontrado");

                    var itemSubtotal = item.Quantity * item.UnitPrice;
                    subtotal += itemSubtotal;

                    var purchaseDetail = new PurchaseDetail
                    {
                        PurchaseID = purchase.PurchaseID,
                        ProductID = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        Subtotal = itemSubtotal
                    };

                    purchaseDetails.Add(purchaseDetail);
                }

                // Calcular totales
                var tax = Math.Round(subtotal * TaxRate, 2);
                var total = Math.Round(subtotal + tax, 2);

                // Actualizar el total de la compra
                purchase.TotalAmount = total;
                _context.Purchases.Update(purchase);

                // Guardar los detalles de la compra
                await _context.PurchaseDetails.AddRangeAsync(purchaseDetails);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                // Notificar nuevo pedido
                await _eventNotificationService.NotifySupplierEvent(
                    SupplierEventType.NewOrder,
                    supplier,
                    GetCurrentUserId()
                );

                // Construir la respuesta
                return new PurchaseResponseDTO
                {
                    Id = $"PUR-{purchase.PurchaseID:D5}",
                    PurchaseDate = purchase.PurchaseDate,
                    ExpectedDeliveryDate = purchase.ExpectedDeliveryDate,
                    SupplierId = supplier.SupplierID,
                    SupplierName = supplier.Name,
                    Items = purchaseDetails.Select(pd => new PurchaseItemResponseDTO
                    {
                        ProductId = pd.ProductID,
                        ProductName = pd.Product?.Name ?? "Producto desconocido",
                        Quantity = pd.Quantity,
                        UnitPrice = pd.UnitPrice,
                        Total = pd.Subtotal
                    }).ToList(),
                    Subtotal = subtotal,
                    Tax = tax,
                    Total = total,
                    Status = purchase.Status,
                    Notes = purchase.Notes
                };
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<(List<PurchaseResponseDTO> Purchases, int Total)> GetAllPurchasesAsync(
            int page = 1,
            int limit = 10,
            string? status = null,
            DateTime? startDate = null,
            DateTime? endDate = null)
        {
            var query = _context.Purchases
                .Include(p => p.Supplier)
                .Include(p => p.PurchaseDetails)
                    .ThenInclude(pd => pd.Product)
                .Where(p => p.PurchaseDetails.All(pd => pd.Product != null && pd.Product.Status != "deleted"))
                .AsQueryable();

            // Aplicar filtros
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(p => p.Status == status);
            }

            if (startDate.HasValue)
            {
                query = query.Where(p => p.PurchaseDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(p => p.PurchaseDate <= endDate.Value);
            }

            // Obtener total antes de paginación
            var total = await query.CountAsync();

            // Aplicar paginación
            var purchases = await query
                .OrderByDescending(p => p.PurchaseDate)
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(p => new PurchaseResponseDTO
                {
                    Id = $"PUR-{p.PurchaseID:D5}",
                    PurchaseDate = p.PurchaseDate,
                    ExpectedDeliveryDate = p.ExpectedDeliveryDate,
                    SupplierId = p.SupplierID,
                    SupplierName = p.Supplier != null ? p.Supplier.Name : "Proveedor desconocido",
                    Items = p.PurchaseDetails.Select(pd => new PurchaseItemResponseDTO
                    {
                        ProductId = pd.ProductID,
                        ProductName = pd.Product != null ? pd.Product.Name : "Producto desconocido",
                        Quantity = pd.Quantity,
                        UnitPrice = pd.UnitPrice,
                        Total = pd.Subtotal
                    }).ToList(),
                    Subtotal = p.PurchaseDetails.Sum(pd => pd.Subtotal),
                    Tax = Math.Round(p.PurchaseDetails.Sum(pd => pd.Subtotal) * TaxRate, 2),
                    Total = p.TotalAmount,
                    Status = p.Status,
                    Notes = p.Notes
                })
                .ToListAsync();

            return (purchases, total);
        }

        public async Task<PurchaseResponseDTO?> GetPurchaseByIdAsync(int id)
        {
            var purchase = await _context.Purchases
                .Include(p => p.Supplier)
                .Include(p => p.PurchaseDetails)
                    .ThenInclude(pd => pd.Product)
                .Where(p => p.PurchaseDetails.All(pd => pd.Product != null && pd.Product.Status != "deleted"))
                .FirstOrDefaultAsync(p => p.PurchaseID == id);

            if (purchase == null)
                return null;

            return new PurchaseResponseDTO
            {
                Id = $"PUR-{purchase.PurchaseID:D5}",
                PurchaseDate = purchase.PurchaseDate,
                ExpectedDeliveryDate = purchase.ExpectedDeliveryDate,
                SupplierId = purchase.SupplierID,
                SupplierName = purchase.Supplier != null ? purchase.Supplier.Name : "Proveedor desconocido",
                Items = purchase.PurchaseDetails.Select(pd => new PurchaseItemResponseDTO
                {
                    ProductId = pd.ProductID,
                    ProductName = pd.Product != null ? pd.Product.Name : "Producto desconocido",
                    Quantity = pd.Quantity,
                    UnitPrice = pd.UnitPrice,
                    Total = pd.Subtotal
                }).ToList(),
                Subtotal = purchase.PurchaseDetails.Sum(pd => pd.Subtotal),
                Tax = Math.Round(purchase.PurchaseDetails.Sum(pd => pd.Subtotal) * TaxRate, 2),
                Total = purchase.TotalAmount,
                Status = purchase.Status,
                Notes = purchase.Notes
            };
        }

        public async Task<PurchaseResponseDTO> UpdatePurchaseStatusAsync(int id, string newStatus)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var purchase = await _context.Purchases
                    .Include(p => p.PurchaseDetails)
                    .Include(p => p.Supplier)
                    .FirstOrDefaultAsync(p => p.PurchaseID == id);

                if (purchase == null)
                    throw new KeyNotFoundException($"Pedido con ID {id} no encontrado");

                if (purchase.Status == newStatus)
                    throw new InvalidOperationException($"El pedido ya está en estado {newStatus}");

                // Validar que el nuevo estado sea válido
                if (newStatus != "received" && newStatus != "cancelled")
                    throw new InvalidOperationException("Estado no válido. Debe ser 'received' o 'cancelled'");

                // Si el pedido ya está cancelado o recibido, no se puede cambiar
                if (purchase.Status == "cancelled" || purchase.Status == "received")
                    throw new InvalidOperationException($"No se puede cambiar el estado de un pedido {purchase.Status}");

                // Si el nuevo estado es "received", actualizar el inventario
                if (newStatus == "received")
                {
                    foreach (var detail in purchase.PurchaseDetails)
                    {
                        var product = await _context.Products.FindAsync(detail.ProductID);
                        if (product == null)
                            throw new KeyNotFoundException($"Producto con ID {detail.ProductID} no encontrado");

                        // Actualizar el stock del producto
                        product.StockQuantity += detail.Quantity;

                        // Registrar la transacción
                        var inventoryTransaction = new InventoryTransaction
                        {
                            ProductID = detail.ProductID,
                            TransactionType = "Compra",
                            Quantity = detail.Quantity,
                            PreviousStock = product.StockQuantity - detail.Quantity,
                            NewStock = product.StockQuantity,
                            TransactionDate = DateTime.UtcNow,
                            UserID = GetCurrentUserId(),
                            Notes = $"Recepción de pedido PUR-{purchase.PurchaseID:D5}"
                        };

                        _context.InventoryTransactions.Add(inventoryTransaction);
                    }

                    // Notificar pedido recibido
                    await _eventNotificationService.NotifySupplierEvent(
                        SupplierEventType.OrderReceived,
                        purchase.Supplier,
                        GetCurrentUserId()
                    );
                }
                else if (newStatus == "cancelled")
                {
                    // Notificar pedido cancelado
                    await _eventNotificationService.NotifySupplierEvent(
                        SupplierEventType.OrderCancelled,
                        purchase.Supplier,
                        GetCurrentUserId()
                    );
                }

                // Actualizar el estado del pedido
                purchase.Status = newStatus;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Retornar el pedido actualizado
                return await GetPurchaseByIdAsync(id) ?? 
                    throw new InvalidOperationException("Error al recuperar el pedido actualizado");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
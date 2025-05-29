// Services/EventNotificationService.cs
using System;
using System.Threading.Tasks;
using proyectInvetoryDSI.Data;
using proyectInvetoryDSI.Models;
using proyectInvetoryDSI.Services;

namespace proyectInvetoryDSI.Services
{
    public interface IEventNotificationService
    {
        Task NotifyInventoryEvent(InventoryEventType eventType, Product product, int? userId = null);
        Task NotifySaleEvent(SaleEventType eventType, Sale sale, int? userId = null);
        Task NotifyCustomerEvent(CustomerEventType eventType, Customer customer, int? userId = null);
        Task NotifySupplierEvent(SupplierEventType eventType, Supplier supplier, int? userId = null);
    }

    public class EventNotificationService : IEventNotificationService
    {
        private readonly INotificationService _notificationService;
        private readonly INotificationSettingsService _notificationSettingsService;
        private readonly AppDbContext _context;
        private static readonly TimeZoneInfo ElSalvadorTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Central America Standard Time");

        public EventNotificationService(INotificationService notificationService, INotificationSettingsService notificationSettingsService, AppDbContext context)
        {
            _notificationService = notificationService;
            _notificationSettingsService = notificationSettingsService;
            _context = context;
        }

        private DateTime GetElSalvadorTime()
        {
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ElSalvadorTimeZone);
        }

        public async Task NotifyInventoryEvent(InventoryEventType eventType, Product product, int? userId = null)
        {
            // Validar configuración de usuario
            if (userId.HasValue)
            {
                var settings = await _notificationSettingsService.GetUserNotificationSettingsAsync(userId.Value);
                if (eventType == InventoryEventType.LowStock && !settings.LowStockAlerts) return;
                if (eventType == InventoryEventType.CriticalStock && !settings.LowStockAlerts) return;
                if (eventType == InventoryEventType.OutOfStock && !settings.LowStockAlerts) return;
                if (eventType == InventoryEventType.NearExpiration && !settings.ExpirationAlerts) return;
                if (eventType == InventoryEventType.Expired && !settings.ExpiredProductAlerts) return;
                if (eventType == InventoryEventType.InventoryAdjustment && !settings.StockAdjustmentAlerts) return;
            }

            string title = "";
            string message = "";
            string type = "";
            string category = "inventory";

            switch (eventType)
            {
                case InventoryEventType.LowStock:
                    title = $"Stock bajo de {product.Name}";
                    message = $"El stock de {product.Name} ha alcanzado el nivel mínimo. Quedan {product.StockQuantity} unidades.";
                    type = "warning";
                    break;

                case InventoryEventType.CriticalStock:
                    title = $"Stock CRÍTICO de {product.Name}";
                    message = $"El stock de {product.Name} está en nivel CRÍTICO. Quedan {product.StockQuantity} unidades.";
                    type = "error";
                    break;

                case InventoryEventType.OutOfStock:
                    title = $"Producto AGOTADO: {product.Name}";
                    message = $"El producto {product.Name} se ha agotado. Stock actual: 0 unidades.";
                    type = "error";
                    break;

                case InventoryEventType.NearExpiration:
                    title = $"Producto próximo a caducar: {product.Name}";
                    message = $"El producto {product.Name} caducará en {(product.ExpirationDate - GetElSalvadorTime())?.Days} días.";
                    type = "warning";
                    break;

                case InventoryEventType.Expired:
                    title = $"Producto CADUCADO: {product.Name}";
                    message = $"El producto {product.Name} ha caducado. Fecha de caducidad: {product.ExpirationDate?.ToString("dd/MM/yyyy")}";
                    type = "error";
                    break;

                case InventoryEventType.InventoryAdjustment:
                    title = $"Ajuste de inventario: {product.Name}";
                    message = $"Se ha realizado un ajuste manual en el inventario de {product.Name}.";
                    type = "info";
                    break;

                case InventoryEventType.NewProductAdded:
                    title = $"Nuevo producto añadido: {product.Name}";
                    message = $"Se ha añadido el producto {product.Name} al inventario. Stock inicial: {product.StockQuantity} unidades.";
                    type = "success";
                    break;

                case InventoryEventType.ProductDeleted:
                    title = $"Producto eliminado: {product.Name}";
                    message = $"El producto {product.Name} (ID: {product.ProductID}) ha sido eliminado del inventario.";
                    type = "warning";
                    break;
            }

            await _notificationService.CreateNotificationAsync(
                title,
                message,
                type,
                category,
                product.ProductID.ToString(),
                "product",
                userId
            );
        }

        public async Task NotifySaleEvent(SaleEventType eventType, Sale sale, int? userId = null)
        {
            // Validar configuración de usuario
            if (userId.HasValue)
            {
                var settings = await _notificationSettingsService.GetUserNotificationSettingsAsync(userId.Value);
                if (eventType == SaleEventType.Completed && !settings.SalesAlerts) return;
            }

            string title = "";
            string message = "";
            string type = "";
            string category = "sales";

            var customer = await _context.Customers.FindAsync(sale.CustomerID);

            switch (eventType)
            {
                case SaleEventType.Completed:
                    title = $"Venta completada #{sale.SaleID}";
                    message = $"La venta #{sale.SaleID} por {sale.TotalAmount:C2} ha sido completada exitosamente. Cliente: {customer?.Name ?? "No especificado"}";
                    type = "success";
                    break;
            }

            await _notificationService.CreateNotificationAsync(
                title,
                message,
                type,
                category,
                sale.SaleID.ToString(),
                "sale",
                userId
            );
        }

        public async Task NotifyCustomerEvent(CustomerEventType eventType, Customer customer, int? userId = null)
        {
            // Validar configuración de usuario
            if (userId.HasValue)
            {
                var settings = await _notificationSettingsService.GetUserNotificationSettingsAsync(userId.Value);
                if (eventType == CustomerEventType.NewCustomer && !settings.EditAlerts) return;
                if (eventType == CustomerEventType.CustomerUpdated && !settings.EditAlerts) return;
            }

            string title = "";
            string message = "";
            string type = "";
            string category = "customers";

            switch (eventType)
            {
                case CustomerEventType.NewCustomer:
                    title = $"Nuevo cliente registrado: {customer.Name}";
                    message = $"Se ha registrado un nuevo cliente: {customer.Name}";
                    type = "success";
                    break;

                case CustomerEventType.CustomerUpdated:
                    title = $"Actualización de cliente: {customer.Name}";
                    message = $"Se han actualizado los datos del cliente {customer.Name}";
                    type = "info";
                    break;
            }

            await _notificationService.CreateNotificationAsync(
                title,
                message,
                type,
                category,
                customer.CustomerID.ToString(),
                "customer",
                userId
            );
        }

        public async Task NotifySupplierEvent(SupplierEventType eventType, Supplier supplier, int? userId = null)
        {
            // Validar configuración de usuario
            if (userId.HasValue)
            {
                var settings = await _notificationSettingsService.GetUserNotificationSettingsAsync(userId.Value);
                if (eventType == SupplierEventType.NewOrder && !settings.EditAlerts) return;
                if (eventType == SupplierEventType.OrderReceived && !settings.EditAlerts) return;
                if (eventType == SupplierEventType.OrderCancelled && !settings.EditAlerts) return;
                if (eventType == SupplierEventType.NewSupplier && !settings.EditAlerts) return;
            }

            string title = "";
            string message = "";
            string type = "";
            string category = "suppliers";

            switch (eventType)
            {
                case SupplierEventType.NewOrder:
                    title = $"Nuevo pedido a {supplier.Name}";
                    message = $"Se ha creado un nuevo pedido al proveedor {supplier.Name}";
                    type = "info";
                    break;

                case SupplierEventType.OrderReceived:
                    title = $"Pedido recibido de {supplier.Name}";
                    message = $"Se ha recibido completamente un pedido del proveedor {supplier.Name}";
                    type = "success";
                    break;

                case SupplierEventType.OrderCancelled:
                    title = $"Pedido cancelado con {supplier.Name}";
                    message = $"Un pedido con el proveedor {supplier.Name} ha sido cancelado";
                    type = "error";
                    break;

                case SupplierEventType.NewSupplier:
                    title = $"Nuevo proveedor: {supplier.Name}";
                    message = $"Se ha registrado un nuevo proveedor: {supplier.Name}";
                    type = "success";
                    break;
            }

            await _notificationService.CreateNotificationAsync(
                title,
                message,
                type,
                category,
                supplier.SupplierID.ToString(),
                "supplier",
                userId
            );
        }
    }

    public enum InventoryEventType
    {
        LowStock,
        CriticalStock,
        OutOfStock,
        NearExpiration,
        Expired,
        InventoryAdjustment,
        NewProductAdded,
        ProductDeleted
    }

    public enum SaleEventType
    {
        Completed
    }

    public enum CustomerEventType
    {
        NewCustomer,
        CustomerUpdated
    }

    public enum SupplierEventType
    {
        NewOrder,
        OrderReceived,
        OrderCancelled,
        NewSupplier
    }
}
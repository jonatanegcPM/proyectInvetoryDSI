using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using proyectInvetoryDSI.Data;
using proyectInvetoryDSI.Models;

namespace proyectInvetoryDSI.Services
{
    public class InventoryCheckService : BackgroundService
    {
        private readonly ILogger<InventoryCheckService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(2);

        public InventoryCheckService(
            ILogger<InventoryCheckService> logger,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("Iniciando verificación automática de inventario");
                    await CheckInventoryAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error durante la verificación automática de inventario");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
        }

        private async Task CheckInventoryAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var notificationService = scope.ServiceProvider.GetRequiredService<IEventNotificationService>();

            // Verificar productos con stock bajo
            var lowStockProducts = await context.Products
                .Where(p => p.Status != "deleted" && p.ReorderLevel.HasValue)
                .ToListAsync();

            foreach (var product in lowStockProducts)
            {
                if (product.StockQuantity <= 0)
                {
                    await notificationService.NotifyInventoryEvent(
                        InventoryEventType.OutOfStock,
                        product
                    );
                }
                else if (product.StockQuantity < 5 || product.StockQuantity < (product.ReorderLevel.Value * 0.1))
                {
                    await notificationService.NotifyInventoryEvent(
                        InventoryEventType.CriticalStock,
                        product
                    );
                }
                else if (product.StockQuantity <= product.ReorderLevel.Value)
                {
                    await notificationService.NotifyInventoryEvent(
                        InventoryEventType.LowStock,
                        product
                    );
                }

                // Verificar fecha de caducidad
                if (product.ExpirationDate.HasValue)
                {
                    var daysToExpire = (product.ExpirationDate.Value - DateTime.Now).Days;

                    if (daysToExpire <= 0)
                    {
                        await notificationService.NotifyInventoryEvent(
                            InventoryEventType.Expired,
                            product
                        );
                    }
                    else if (daysToExpire <= 90)
                    {
                        await notificationService.NotifyInventoryEvent(
                            InventoryEventType.NearExpiration,
                            product
                        );
                    }
                }
            }
        }
    }
} 
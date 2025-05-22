// Services/NotificationSettingsService.cs
using Microsoft.EntityFrameworkCore;
using proyectInvetoryDSI.Data;
using proyectInvetoryDSI.DTOs;
using proyectInvetoryDSI.Models;

namespace proyectInvetoryDSI.Services
{
    public interface INotificationSettingsService
    {
        Task<NotificationSettingsDTO> GetUserNotificationSettingsAsync(int userId);
        Task<NotificationSettingsDTO> UpdateUserNotificationSettingsAsync(int userId, UpdateNotificationSettingsDTO dto);
    }

    public class NotificationSettingsService : INotificationSettingsService
    {
        private readonly AppDbContext _context;

        public NotificationSettingsService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<NotificationSettingsDTO> GetUserNotificationSettingsAsync(int userId)
        {
            var settings = await _context.NotificationSettings
                .FirstOrDefaultAsync(ns => ns.UserId == userId);

            if (settings == null)
            {
                // Crear configuración por defecto si no existe
                settings = new NotificationSettings
                {
                    UserId = userId
                };
                _context.NotificationSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return new NotificationSettingsDTO
            {
                LowStockAlerts = settings.LowStockAlerts,
                ExpirationAlerts = settings.ExpirationAlerts,
                ExpiredProductAlerts = settings.ExpiredProductAlerts,
                EditAlerts = settings.EditAlerts,
                StockAdjustmentAlerts = settings.StockAdjustmentAlerts,
                SalesAlerts = settings.SalesAlerts
            };
        }

        public async Task<NotificationSettingsDTO> UpdateUserNotificationSettingsAsync(int userId, UpdateNotificationSettingsDTO dto)
        {
            var settings = await _context.NotificationSettings
                .FirstOrDefaultAsync(ns => ns.UserId == userId);

            if (settings == null)
            {
                settings = new NotificationSettings { UserId = userId };
                _context.NotificationSettings.Add(settings);
            }

            // Actualizar solo los valores proporcionados
            if (dto.LowStockAlerts.HasValue)
                settings.LowStockAlerts = dto.LowStockAlerts.Value;
            if (dto.ExpirationAlerts.HasValue)
                settings.ExpirationAlerts = dto.ExpirationAlerts.Value;
            if (dto.ExpiredProductAlerts.HasValue)
                settings.ExpiredProductAlerts = dto.ExpiredProductAlerts.Value;
            if (dto.EditAlerts.HasValue)
                settings.EditAlerts = dto.EditAlerts.Value;
            if (dto.StockAdjustmentAlerts.HasValue)
                settings.StockAdjustmentAlerts = dto.StockAdjustmentAlerts.Value;
            if (dto.SalesAlerts.HasValue)
                settings.SalesAlerts = dto.SalesAlerts.Value;

            settings.LastUpdated = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new NotificationSettingsDTO
            {
                LowStockAlerts = settings.LowStockAlerts,
                ExpirationAlerts = settings.ExpirationAlerts,
                ExpiredProductAlerts = settings.ExpiredProductAlerts,
                EditAlerts = settings.EditAlerts,
                StockAdjustmentAlerts = settings.StockAdjustmentAlerts,
                SalesAlerts = settings.SalesAlerts
            };
        }
    }
}
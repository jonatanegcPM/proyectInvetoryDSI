using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using proyectInvetoryDSI.Data;
using proyectInvetoryDSI.DTOs;
using proyectInvetoryDSI.Models;

namespace proyectInvetoryDSI.Services
{
    public interface INotificationService
    {
        Task<(List<NotificationDTO> notifications, int totalCount)> GetNotificationsAsync(int userId, int page = 1, int limit = 20, string filter = "all", string category = null);
        Task<NotificationDTO> MarkAsReadAsync(string id, int userId);
        Task<int> MarkAllAsReadAsync(int userId);
        Task<DeleteNotificationResponseDTO> DeleteNotificationAsync(string id, int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task CreateNotificationAsync(string title, string message, string type, string category, string entityId = null, string entityType = null, int? userId = null);
    }

    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;

        public NotificationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(List<NotificationDTO> notifications, int totalCount)> GetNotificationsAsync(int userId, int page = 1, int limit = 20, string filter = "all", string category = null)
        {
            IQueryable<Notification> query = _context.Notifications
                .Where(n => n.UserId == null || n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt);

            // Aplicar filtros
            if (filter == "read")
            {
                query = query.Where(n => n.Read);
            }
            else if (filter == "unread")
            {
                query = query.Where(n => !n.Read);
            }

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(n => n.Category == category);
            }

            // Obtener el conteo total antes de paginar
            int totalCount = await query.CountAsync();

            // Aplicar paginación
            var notifications = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(n => new NotificationDTO
                {
                    Id = n.Id,
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type,
                    CreatedAt = n.CreatedAt,
                    Read = n.Read,
                    Category = n.Category,
                    EntityId = n.EntityId,
                    EntityType = n.EntityType
                })
                .ToListAsync();

            return (notifications, totalCount);
        }

        public async Task<NotificationDTO> MarkAsReadAsync(string id, int userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && (n.UserId == null || n.UserId == userId));

            if (notification == null)
            {
                return null;
            }

            notification.Read = true;
            await _context.SaveChangesAsync();

            return new NotificationDTO
            {
                Id = notification.Id,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type,
                CreatedAt = notification.CreatedAt,
                Read = notification.Read,
                Category = notification.Category,
                EntityId = notification.EntityId,
                EntityType = notification.EntityType
            };
        }

        public async Task<int> MarkAllAsReadAsync(int userId)
        {
            var unreadNotifications = await _context.Notifications
                .Where(n => !n.Read && (n.UserId == null || n.UserId == userId))
                .ToListAsync();

            foreach (var notification in unreadNotifications)
            {
                notification.Read = true;
            }

            await _context.SaveChangesAsync();

            return unreadNotifications.Count;
        }

        public async Task<DeleteNotificationResponseDTO> DeleteNotificationAsync(string id, int userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && (n.UserId == null || n.UserId == userId));

            if (notification == null)
            {
                return null;
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return new DeleteNotificationResponseDTO
            {
                Success = true,
                Id = id
            };
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _context.Notifications
                .CountAsync(n => !n.Read && (n.UserId == null || n.UserId == userId));
        }

        public async Task CreateNotificationAsync(string title, string message, string type, string category, string entityId = null, string entityType = null, int? userId = null)
        {
            var notification = new Notification
            {
                Title = title,
                Message = message,
                Type = type,
                Category = category,
                EntityId = entityId,
                EntityType = entityType,
                UserId = userId
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }
    }
}
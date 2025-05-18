using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using proyectInvetoryDSI.DTOs;
using proyectInvetoryDSI.Services;

namespace proyectInvetoryDSI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 20,
            [FromQuery] string filter = "all",
            [FromQuery] string category = null)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            
            var (notifications, totalCount) = await _notificationService.GetNotificationsAsync(
                userId, page, limit, filter, category);

            return Ok(new
            {
                notifications,
                totalCount,
                page,
                totalPages = (int)Math.Ceiling(totalCount / (double)limit)
            });
        }

        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(string id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            
            var result = await _notificationService.MarkAsReadAsync(id, userId);
            
            if (result == null)
            {
                return NotFound();
            }

            return Ok(new MarkAsReadResponseDTO
            {
                Success = true,
                Notification = result
            });
        }

        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            
            var count = await _notificationService.MarkAllAsReadAsync(userId);
            
            return Ok(new MarkAllAsReadResponseDTO
            {
                Success = true,
                Count = count
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(string id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            
            var result = await _notificationService.DeleteNotificationAsync(id, userId);
            
            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            
            var count = await _notificationService.GetUnreadCountAsync(userId);
            
            return Ok(new NotificationCountDTO
            {
                Count = count
            });
        }
    }
}
// Controllers/NotificationSettingsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using proyectInvetoryDSI.DTOs;
using proyectInvetoryDSI.Services;
using System.Security.Claims;

namespace proyectInvetoryDSI.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    [Authorize]
    public class NotificationSettingsController : ControllerBase
    {
        private readonly INotificationSettingsService _notificationSettingsService;

        public NotificationSettingsController(INotificationSettingsService notificationSettingsService)
        {
            _notificationSettingsService = notificationSettingsService;
        }

        [HttpGet("settings")]
        public async Task<ActionResult<NotificationSettingsDTO>> GetNotificationSettings()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var settings = await _notificationSettingsService.GetUserNotificationSettingsAsync(userId);
            return Ok(settings);
        }

        [HttpPut("settings")]
        public async Task<ActionResult<NotificationSettingsDTO>> UpdateNotificationSettings([FromBody] UpdateNotificationSettingsDTO dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var settings = await _notificationSettingsService.UpdateUserNotificationSettingsAsync(userId, dto);
            return Ok(settings);
        }
    }
}
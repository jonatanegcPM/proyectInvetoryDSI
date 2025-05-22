// Controllers/SettingsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using proyectInvetoryDSI.DTOs;
using proyectInvetoryDSI.Services;
using System.Security.Claims;

namespace proyectInvetoryDSI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SettingsController : ControllerBase
    {
        private readonly ISettingsService _settingsService;

        public SettingsController(ISettingsService settingsService)
        {
            _settingsService = settingsService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SettingsDTO>>> GetAllSettings()
        {
            var settings = await _settingsService.GetAllSettingsAsync();
            return Ok(settings);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SettingsDTO>> GetSettingById(int id)
        {
            var setting = await _settingsService.GetSettingByIdAsync(id);
            if (setting == null) return NotFound();
            return Ok(setting);
        }

        [HttpGet("key/{key}")]
        public async Task<ActionResult<SettingsDTO>> GetSettingByKey(string key)
        {
            var setting = await _settingsService.GetSettingByKeyAsync(key);
            if (setting == null) return NotFound();
            return Ok(setting);
        }

        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<SettingsDTO>>> GetSettingsByCategory(string category)
        {
            var settings = await _settingsService.GetSettingsByCategoryAsync(category);
            return Ok(settings);
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")] // Cambiado de [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SettingsDTO>> CreateSetting(CreateSettingsDTO dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var setting = await _settingsService.CreateSettingAsync(dto, userId);
            return CreatedAtAction(nameof(GetSettingById), new { id = setting.Id }, setting);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<SettingsDTO>> UpdateSetting(int id, UpdateSettingsDTO dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var setting = await _settingsService.UpdateSettingAsync(id, dto, userId);
            if (setting == null) return NotFound();
            return Ok(setting);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteSetting(int id)
        {
            var result = await _settingsService.DeleteSettingAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        // Endpoint para inicializar configuraciones por defecto
        [HttpPost("initialize")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> InitializeSettings()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            await _settingsService.InitializeDefaultSettingsAsync(userId);
            return Ok();
        }
    }
}
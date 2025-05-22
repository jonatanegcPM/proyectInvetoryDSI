// Services/SettingsService.cs
using Microsoft.EntityFrameworkCore;
using proyectInvetoryDSI.Data;
using proyectInvetoryDSI.DTOs;
using proyectInvetoryDSI.Models;

namespace proyectInvetoryDSI.Services
{
    public interface ISettingsService
    {
        Task<IEnumerable<SettingsDTO>> GetAllSettingsAsync();
        Task<SettingsDTO> GetSettingByIdAsync(int id);
        Task<SettingsDTO> GetSettingByKeyAsync(string key);
        Task<IEnumerable<SettingsDTO>> GetSettingsByCategoryAsync(string category);
        Task<SettingsDTO> CreateSettingAsync(CreateSettingsDTO dto, int userId);
        Task<SettingsDTO> UpdateSettingAsync(int id, UpdateSettingsDTO dto, int userId);
        Task<bool> DeleteSettingAsync(int id);
        Task<string> GetSettingValueAsync(string key);
        Task InitializeDefaultSettingsAsync(int userId);
    }

    public class SettingsService : ISettingsService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SettingsService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<IEnumerable<SettingsDTO>> GetAllSettingsAsync()
        {
            return await _context.Settings
                .Select(s => new SettingsDTO
                {
                    Id = s.Id,
                    Key = s.Key,
                    Value = s.Value,
                    Description = s.Description,
                    Category = s.Category
                })
                .ToListAsync();
        }

        public async Task<SettingsDTO> GetSettingByIdAsync(int id)
        {
            var setting = await _context.Settings.FindAsync(id);
            if (setting == null) return null;

            return new SettingsDTO
            {
                Id = setting.Id,
                Key = setting.Key,
                Value = setting.Value,
                Description = setting.Description,
                Category = setting.Category
            };
        }

        public async Task<SettingsDTO> GetSettingByKeyAsync(string key)
        {
            var setting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == key);
            if (setting == null) return null;

            return new SettingsDTO
            {
                Id = setting.Id,
                Key = setting.Key,
                Value = setting.Value,
                Description = setting.Description,
                Category = setting.Category
            };
        }

        public async Task<IEnumerable<SettingsDTO>> GetSettingsByCategoryAsync(string category)
        {
            return await _context.Settings
                .Where(s => s.Category == category)
                .Select(s => new SettingsDTO
                {
                    Id = s.Id,
                    Key = s.Key,
                    Value = s.Value,
                    Description = s.Description,
                    Category = s.Category
                })
                .ToListAsync();
        }

        public async Task<SettingsDTO> CreateSettingAsync(CreateSettingsDTO dto, int userId)
        {
            var existingSetting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == dto.Key);
            if (existingSetting != null)
            {
                throw new Exception("A setting with this key already exists.");
            }

            var setting = new Settings
            {
                Key = dto.Key,
                Value = dto.Value,
                Description = dto.Description,
                Category = dto.Category,
                CreatedAt = DateTime.UtcNow,
                UpdatedBy = userId
            };

            _context.Settings.Add(setting);
            await _context.SaveChangesAsync();

            return new SettingsDTO
            {
                Id = setting.Id,
                Key = setting.Key,
                Value = setting.Value,
                Description = setting.Description,
                Category = setting.Category
            };
        }

        public async Task<SettingsDTO> UpdateSettingAsync(int id, UpdateSettingsDTO dto, int userId)
        {
            var setting = await _context.Settings.FindAsync(id);
            if (setting == null) return null;

            setting.Value = dto.Value;
            if (!string.IsNullOrEmpty(dto.Description))
                setting.Description = dto.Description;
            if (!string.IsNullOrEmpty(dto.Category))
                setting.Category = dto.Category;
            setting.UpdatedAt = DateTime.UtcNow;
            setting.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            return new SettingsDTO
            {
                Id = setting.Id,
                Key = setting.Key,
                Value = setting.Value,
                Description = setting.Description,
                Category = setting.Category
            };
        }

        public async Task<bool> DeleteSettingAsync(int id)
        {
            var setting = await _context.Settings.FindAsync(id);
            if (setting == null) return false;

            _context.Settings.Remove(setting);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<string> GetSettingValueAsync(string key)
        {
            var setting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == key);
            return setting?.Value;
        }

        public async Task InitializeDefaultSettingsAsync(int userId)
        {
            var defaultSettings = new List<CreateSettingsDTO>
            {
                new() { Key = "Inventory.LowStockThreshold", Value = "10", Description = "Threshold for low stock alerts", Category = "Inventory" },
                new() { Key = "App.Name", Value = "Farmacias Brasil", Description = "Application name", Category = "General" },
                new() { Key = "App.Version", Value = "1.0.0", Description = "Application version", Category = "General" },
                new() { Key = "Inventory.AutoReorder", Value = "true", Description = "Enable automatic reordering", Category = "Inventory" },
                new() { Key = "Email.NotificationsEnabled", Value = "true", Description = "Enable email notifications", Category = "Email" }
            };

            foreach (var setting in defaultSettings)
            {
                var exists = await _context.Settings.AnyAsync(s => s.Key == setting.Key);
                if (!exists)
                {
                    await CreateSettingAsync(setting, userId);
                }
            }
        }
    }
}
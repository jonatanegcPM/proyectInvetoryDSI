// DTOs/SettingsDTO.cs
namespace proyectInvetoryDSI.DTOs
{
    public class SettingsDTO
    {
        public int Id { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = "General";
    }

    public class CreateSettingsDTO
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = "General";
    }

    public class UpdateSettingsDTO
    {
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Category { get; set; }
    }
}
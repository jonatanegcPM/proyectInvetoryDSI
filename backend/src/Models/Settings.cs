// Models/Settings.cs
namespace proyectInvetoryDSI.Models
{
    public class Settings
    {
        public int Id { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = "General";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }
        
        // Relación con el usuario que actualizó la configuración
        public User? UpdatedByUser { get; set; }
    }
}
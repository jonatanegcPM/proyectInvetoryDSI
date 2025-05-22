// Models/NotificationSettings.cs
namespace proyectInvetoryDSI.Models
{
    public class NotificationSettings
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public bool LowStockAlerts { get; set; } = true;
        public bool ExpirationAlerts { get; set; } = true;
        public bool ExpiredProductAlerts { get; set; } = true;
        public bool EditAlerts { get; set; } = true;
        public bool StockAdjustmentAlerts { get; set; } = true;
        public bool SalesAlerts { get; set; } = true;
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        
        public User? User { get; set; }
    }
}
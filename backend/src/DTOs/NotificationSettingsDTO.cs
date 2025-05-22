// DTOs/NotificationSettingsDTO.cs
namespace proyectInvetoryDSI.DTOs
{
    public class NotificationSettingsDTO
    {
        public bool LowStockAlerts { get; set; }
        public bool ExpirationAlerts { get; set; }
        public bool ExpiredProductAlerts { get; set; }
        public bool EditAlerts { get; set; }
        public bool StockAdjustmentAlerts { get; set; }
        public bool SalesAlerts { get; set; }
    }

    public class UpdateNotificationSettingsDTO
    {
        public bool? LowStockAlerts { get; set; }
        public bool? ExpirationAlerts { get; set; }
        public bool? ExpiredProductAlerts { get; set; }
        public bool? EditAlerts { get; set; }
        public bool? StockAdjustmentAlerts { get; set; }
        public bool? SalesAlerts { get; set; }
    }
}
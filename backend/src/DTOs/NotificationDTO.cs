using System;

namespace proyectInvetoryDSI.DTOs
{
    public class NotificationDTO
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string Type { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool Read { get; set; }
        public string Category { get; set; }
        public string EntityId { get; set; }
        public string EntityType { get; set; }
    }

    public class NotificationCountDTO
    {
        public int Count { get; set; }
    }

    public class MarkAsReadResponseDTO
    {
        public bool Success { get; set; }
        public NotificationDTO Notification { get; set; }
    }

    public class MarkAllAsReadResponseDTO
    {
        public bool Success { get; set; }
        public int Count { get; set; }
    }

    public class DeleteNotificationResponseDTO
    {
        public bool Success { get; set; }
        public string Id { get; set; }
    }
}
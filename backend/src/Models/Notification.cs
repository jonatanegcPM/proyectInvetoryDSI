using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace proyectInvetoryDSI.Models
{
    public class Notification
    {
        [Key]
        public string Id { get; set; } = $"notif-{Guid.NewGuid().ToString().Substring(0, 8)}";
        
        [Required]
        public string Title { get; set; }
        
        [Required]
        public string Message { get; set; }
        
        [Required]
        public string Type { get; set; } // info, warning, error, success
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public bool Read { get; set; } = false;
        
        public string Category { get; set; } // system, inventory, sales, etc.
        
        public string EntityId { get; set; } // ID de la entidad relacionada
        
        public string EntityType { get; set; } // Tipo de entidad relacionada
        
        [ForeignKey("User")]
        public int? UserId { get; set; } // Usuario destinatario (null para todos)
        
        public virtual User User { get; set; }
    }
}
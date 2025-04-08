using System.ComponentModel.DataAnnotations;

namespace proyectInvetoryDSI.Models
{
    public class InventoryTransaction
    {
        [Key]
        public int TransactionID { get; set; }
        
        public int ProductID { get; set; }
        public string TransactionType { get; set; } = string.Empty; // 'Recepción', 'Venta', 'Ajuste'
        public int Quantity { get; set; }
        public int PreviousStock { get; set; }
        public int NewStock { get; set; }
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
        public int UserID { get; set; }
        public string? Notes { get; set; }

        // Navigation properties
        public Product? Product { get; set; }
        public User? User { get; set; }
    }
}

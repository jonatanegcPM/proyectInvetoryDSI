using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace proyectInvetoryDSI.Models
{
    public class Product
    {
        [Key]
        public int ProductID { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        
        [Required]
        public int StockQuantity { get; set; }
        
        public DateTime? ExpirationDate { get; set; }
        
        [ForeignKey("Supplier")]
        public int? SupplierID { get; set; }
        
        [StringLength(100)]
        public string? Barcode { get; set; }
        
        [StringLength(50)]
        public string? SKU { get; set; }
        
        [ForeignKey("Category")]
        public int? CategoryID { get; set; }
        
        public int? ReorderLevel { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? CostPrice { get; set; }
        
        [StringLength(100)]
        public string? Location { get; set; }
        
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "in-stock";
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey("Creator")]
        public int? CreatedBy { get; set; }
        
        [Required]
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        // Propiedades de navegación
        public virtual Supplier? Supplier { get; set; }
        public virtual Category? Category { get; set; }
        public virtual User? Creator { get; set; }
        public virtual ICollection<InventoryTransaction>? InventoryTransactions { get; set; }
    }
}
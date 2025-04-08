using System.ComponentModel.DataAnnotations;

namespace proyectInvetoryDSI.DTOs
{
    public class ProductDTO
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string? SKU { get; set; }
        
        [StringLength(100)]
        public string? Barcode { get; set; }
        
        public int? CategoryId { get; set; }
        public string? Category { get; set; }
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        [Required]
        public int Stock { get; set; }
        
        public int? ReorderLevel { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }
        
        [Range(0.01, double.MaxValue)]
        public decimal? CostPrice { get; set; }
        
        public int? SupplierId { get; set; }
        public string? Supplier { get; set; }
        
        public DateTime? ExpiryDate { get; set; }
        
        [StringLength(100)]
        public string? Location { get; set; }
        
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "in-stock";
        
        [Required]
        public DateTime CreatedAt { get; set; }
        
        [Required]
        public DateTime LastUpdated { get; set; }
    }

    public class ProductResponse
    {
        public List<ProductDTO> Products { get; set; } = new List<ProductDTO>();
        public Pagination? Pagination { get; set; }
    }

    public class Pagination
    {
        public int Total { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
        public int Pages { get; set; }
    }

    public class CreateProductDTO
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string? SKU { get; set; }
        
        [StringLength(100)]
        public string? Barcode { get; set; }
        
        public int? CategoryId { get; set; }
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        [Required]
        [Range(0, int.MaxValue)]
        public int Stock { get; set; }
        
        [Range(0, int.MaxValue)]
        public int? ReorderLevel { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }
        
        [Range(0.01, double.MaxValue)]
        public decimal? CostPrice { get; set; }
        
        public int? SupplierId { get; set; }
        
        public DateTime? ExpiryDate { get; set; }
        
        [StringLength(100)]
        public string? Location { get; set; }
    }

    public class UpdateProductDTO
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string? SKU { get; set; }
        
        [StringLength(100)]
        public string? Barcode { get; set; }
        
        public int? CategoryId { get; set; }
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        [Range(0, int.MaxValue)]
        public int? ReorderLevel { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }
        
        [Range(0.01, double.MaxValue)]
        public decimal? CostPrice { get; set; }
        
        public int? SupplierId { get; set; }
        
        public DateTime? ExpiryDate { get; set; }
        
        [StringLength(100)]
        public string? Location { get; set; }
    }

    public class AdjustStockDTO
    {
        [Required]
        public int Quantity { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Type { get; set; } = string.Empty; // "Recepción", "Venta", "Ajuste"
        
        [StringLength(255)]
        public string? Notes { get; set; }
    }

    public class InventoryTransactionDTO
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        
        [StringLength(50)]
        public string Type { get; set; } = string.Empty;
        
        public int ProductId { get; set; }
        
        [StringLength(100)]
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        
        [StringLength(255)]
        public string? Notes { get; set; }
        
        [StringLength(100)]
        public string UserName { get; set; } = string.Empty;
    }

    public class InventoryStatsDTO
    {
        public int TotalProducts { get; set; }
        public int LowStockProducts { get; set; }
        public decimal TotalValue { get; set; }
        public int ExpiringProducts { get; set; }
    }
}
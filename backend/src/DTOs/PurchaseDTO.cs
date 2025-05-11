using System.ComponentModel.DataAnnotations;

namespace proyectInvetoryDSI.DTOs
{
    public class CreatePurchaseDTO
    {
        [Required]
        public int SupplierId { get; set; }
        
        [Required]
        public DateTime ExpectedDeliveryDate { get; set; }
        
        [Required]
        [MinLength(1, ErrorMessage = "Debe agregar al menos un producto al pedido")]
        public List<PurchaseItemDTO> Items { get; set; } = new List<PurchaseItemDTO>();
        
        public string? Notes { get; set; }
    }

    public class PurchaseItemDTO
    {
        [Required]
        public int ProductId { get; set; }
        
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
        public int Quantity { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "El precio unitario debe ser mayor a 0")]
        public decimal UnitPrice { get; set; }
    }

    public class PurchaseResponseDTO
    {
        public string Id { get; set; } = string.Empty;
        public DateTime PurchaseDate { get; set; }
        public DateTime ExpectedDeliveryDate { get; set; }
        public int SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public List<PurchaseItemResponseDTO> Items { get; set; } = new List<PurchaseItemResponseDTO>();
        public decimal Subtotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }
        public string Status { get; set; } = "pending";
        public string? Notes { get; set; }
    }

    public class PurchaseItemResponseDTO
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Total { get; set; }
    }

    public class UpdatePurchaseStatusDTO
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
} 
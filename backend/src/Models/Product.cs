namespace proyectInvetoryDSI.Models
{
    public class Product
    {
        public int ProductID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public int? SupplierID { get; set; } 

        // Navigation Property
        public Supplier? Supplier { get; set; } 
    }
}
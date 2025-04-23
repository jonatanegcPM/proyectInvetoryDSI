// Models/Supplier.cs
namespace proyectInvetoryDSI.Models
{
    public class Supplier
    {
        public int SupplierID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Contact { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Status { get; set; } = "active";
        public string Category { get; set; } = string.Empty;
        
        // Navigation properties
        public ICollection<Product>? Products { get; set; }
        public ICollection<Purchase>? Purchases { get; set; }
    }
}
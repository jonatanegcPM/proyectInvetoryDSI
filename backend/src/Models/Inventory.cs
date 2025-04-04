namespace proyectInvetoryDSI.Models
{
    public class Inventory
    {
        public int InventoryID { get; set; }
        public int ProductID { get; set; }
        public int Quantity { get; set; }
        public DateTime LastUpdated { get; set; }

        // Navigation Property
        public Product? Product { get; set; } 
    }
}
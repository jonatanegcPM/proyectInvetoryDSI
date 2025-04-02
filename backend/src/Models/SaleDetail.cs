namespace proyectInvetoryDSI.Models
{
    public class SaleDetail
    {
        public int SaleDetailID { get; set; }
        public int SaleID { get; set; }
        public int ProductID { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal { get; set; }

        // Navigation Properties
        public Sale? Sale { get; set; } 
        public Product? Product { get; set; } 
    }
}
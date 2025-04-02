namespace proyectInvetoryDSI.Models
{
    public class PurchaseDetail
    {
        public int PurchaseDetailID { get; set; }
        public int PurchaseID { get; set; }
        public int ProductID { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal { get; set; }

        // Navigation Properties
        public Purchase? Purchase { get; set; } 
        public Product? Product { get; set; } 
    }
}
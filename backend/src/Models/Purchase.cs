namespace proyectInvetoryDSI.Models
{
    public class Purchase
    {
        public int PurchaseID { get; set; }
        public DateTime PurchaseDate { get; set; }
        public DateTime ExpectedDeliveryDate { get; set; }
        public int SupplierID { get; set; }
        public decimal TotalAmount { get; set; }
        public int UserID { get; set; }
        public string Status { get; set; } = "pending";
        public string? Notes { get; set; }

        // Navigation Properties
        public Supplier? Supplier { get; set; }
        public User? User { get; set; } 
        public ICollection<PurchaseDetail> PurchaseDetails { get; set; } = new List<PurchaseDetail>();
    }
}
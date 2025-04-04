namespace proyectInvetoryDSI.Models
{
    public class Sale
    {
        public int SaleID { get; set; }
        public DateTime SaleDate { get; set; }
        public int CustomerID { get; set; }
        public decimal TotalAmount { get; set; }
        public int UserID { get; set; }

        // Navigation Properties
        public Customer? Customer { get; set; } 
        public User? User { get; set; } 
        public ICollection<SaleDetail> SaleDetails { get; set; } = new List<SaleDetail>(); // Inicializar
    }
}
namespace proyectInvetoryDSI.Models
{
    public class Invoice
    {
        public int InvoiceID { get; set; }
        public int SaleID { get; set; }
        public DateTime IssueDate { get; set; }
        public decimal TotalAmount { get; set; }

        // Navigation Property
        public Sale? Sale { get; set; }

    }
}

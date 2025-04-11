namespace proyectInvetoryDSI.DTOs
{
    public class SaleItemDTO
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Total { get; set; }
    }

    public class CreateSaleDTO
    {
        public int CustomerId { get; set; }
        public List<SaleItemRequestDTO> Items { get; set; } = new List<SaleItemRequestDTO>();
        public string PaymentMethod { get; set; } = "cash";
        public decimal Total { get; set; }
    }

    public class SaleItemRequestDTO
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class SaleResponseDTO
    {
        public string Id { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int CustomerId { get; set; }
        public CustomerDTO? Customer { get; set; }
        public List<SaleItemDTO> Items { get; set; } = new List<SaleItemDTO>();
        public decimal Subtotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
    }
}
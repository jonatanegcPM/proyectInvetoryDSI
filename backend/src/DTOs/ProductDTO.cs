namespace proyectInvetoryDSI.DTOs
{
    public class ProductDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? Description { get; set; } // Cambiado de Category a Description
        public string? Barcode { get; set; }
        public int Stock { get; set; }
    }

    public class ProductResponse
    {
        public List<ProductDTO> Products { get; set; } = new List<ProductDTO>();
        public Pagination? Pagination { get; set; }
    }

    public class Pagination
    {
        public int Total { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
        public int Pages { get; set; }
    }
}
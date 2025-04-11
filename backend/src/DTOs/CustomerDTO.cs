namespace proyectInvetoryDSI.DTOs
{
    public class CustomerDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
    }

    public class CustomersResponse
    {
        public List<CustomerDTO> Customers { get; set; } = new List<CustomerDTO>();
    }
}
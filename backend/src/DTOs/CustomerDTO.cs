namespace proyectInvetoryDSI.DTOs
{
    public class CustomerDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class CustomersResponse
    {
        public List<CustomerDTO> Customers { get; set; } = new List<CustomerDTO>();
    }
}
// DTOs/CustomerDTO.cs
using System.ComponentModel.DataAnnotations;

namespace proyectInvetoryDSI.DTOs
{
    public class CustomerDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Insurance { get; set; }
        public string Status { get; set; } = "active";
        public string? RegistrationDate { get; set; }
        public string? LastVisit { get; set; }
        public string? Allergies { get; set; }
        public string? Notes { get; set; }
    }

    public class CustomerCreateDTO
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Insurance { get; set; }
        public string Status { get; set; } = "active";
        public string? Allergies { get; set; }
        public string? Notes { get; set; }
    }

    public class CustomerDetailDTO : CustomerDTO
    {
        public int TotalPurchases { get; set; }
        public decimal TotalSpent { get; set; }
        public List<CustomerPurchaseDTO>? Purchases { get; set; }
    }

    public class CustomerPurchaseDTO
    {
        public string Id { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public int Items { get; set; }
        public decimal Total { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
    }

    public class CustomerStatsDTO
    {
        public int Total { get; set; }
        public int Active { get; set; }
        public int Inactive { get; set; }
        public int NewThisMonth { get; set; }
        public int WithInsurance { get; set; }
    }

    public class CustomersResponse
    {
        public List<CustomerDTO> Customers { get; set; } = new List<CustomerDTO>();
        public PaginationDTO Pagination { get; set; } = new PaginationDTO();
    }

    public class PaginationDTO
    {
        public int Total { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
        public int Pages { get; set; }
    }
}
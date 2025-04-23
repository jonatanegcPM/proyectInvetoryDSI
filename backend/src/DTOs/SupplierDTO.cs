// DTOs/SupplierDTO.cs
using System.ComponentModel.DataAnnotations;

namespace proyectInvetoryDSI.DTOs
{
    public class SupplierDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Contact { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Status { get; set; } = "active";
        public int Products { get; set; }
        public string? LastOrder { get; set; }
        public string Category { get; set; } = string.Empty;
    }

    public class SupplierCreateDTO
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Contact { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Phone { get; set; } = string.Empty;
        
        [Required]
        public string Address { get; set; } = string.Empty;
        
        [Required]
        public string Category { get; set; } = string.Empty;
        
        public string Status { get; set; } = "active";
    }

    public class SupplierDetailDTO
    {
        public SupplierDTO Supplier { get; set; } = new SupplierDTO();
        public List<SupplierProductDTO> Products { get; set; } = new List<SupplierProductDTO>();
        public List<SupplierOrderDTO> Orders { get; set; } = new List<SupplierOrderDTO>();
    }

    public class SupplierProductDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int Stock { get; set; }
        public decimal Price { get; set; }
    }

    public class SupplierOrderDTO
    {
        public string Id { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public int Items { get; set; }
        public decimal Total { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class SupplierStatsDTO
    {
        public int Total { get; set; }
        public int Active { get; set; }
        public int Products { get; set; }
        public string? LastOrderDate { get; set; }
    }

    public class SuppliersResponse
    {
        public List<SupplierDTO> Suppliers { get; set; } = new List<SupplierDTO>();
        public PaginationDTO Pagination { get; set; } = new PaginationDTO();
    }

    public class SupplierProductsResponse
    {
        public List<SupplierProductDTO> Products { get; set; } = new List<SupplierProductDTO>();
        public PaginationDTO Pagination { get; set; } = new PaginationDTO();
    }

    public class SupplierOrdersResponse
    {
        public List<SupplierOrderDTO> Orders { get; set; } = new List<SupplierOrderDTO>();
        public PaginationDTO Pagination { get; set; } = new PaginationDTO();
    }

    public class SupplierCategoriesResponse
    {
        public List<string> Categories { get; set; } = new List<string>();
    }
}
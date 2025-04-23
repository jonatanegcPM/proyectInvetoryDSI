// Models/Customer.cs
using System.ComponentModel.DataAnnotations;

namespace proyectInvetoryDSI.Models
{
    public class Customer
    {
        public int CustomerID { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        
        [DataType(DataType.Date)]
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Insurance { get; set; }
        public string Status { get; set; } = "active";
        
        [DataType(DataType.Date)]
        public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;
        
        [DataType(DataType.Date)]
        public DateTime? LastVisit { get; set; }
        public string? Allergies { get; set; }
        public string? Notes { get; set; }
        
        // Navigation properties
        public ICollection<Sale>? Sales { get; set; }
    }
}
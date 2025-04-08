namespace proyectInvetoryDSI.Models
{
    public class Category
    {
        public int CategoryID { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;

        // Propiedades de navegación
        public ICollection<Product>? Products { get; set; }
    }
}
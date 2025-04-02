namespace proyectInvetoryDSI.Models
{
    public class Permission
    {
        public int PermissionID { get; set; }
        public int RoleID { get; set; }
        public string PermissionName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation Property
        public Role? Role { get; set; } 
    }
}
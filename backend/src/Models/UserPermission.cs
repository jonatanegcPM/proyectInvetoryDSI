namespace proyectInvetoryDSI.Models
{
    public class UserPermission
    {
        public int UserPermissionID { get; set; }
        public int UserID { get; set; }
        public int PermissionID { get; set; }

        // Navigation Properties
        public User? User { get; set; } 
        public Permission? Permission { get; set; } 
    }
}
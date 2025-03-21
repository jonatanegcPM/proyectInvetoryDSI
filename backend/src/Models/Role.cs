namespace ProyectScrumTeams.Models
{
    public class Role
    {
        public int RoleID { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }
}

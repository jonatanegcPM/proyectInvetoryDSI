using Microsoft.EntityFrameworkCore;
using ProyectScrumTeams.Models;

namespace ProyectScrumTeams.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; } // Agregar esta línea

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureSupplier(modelBuilder);
            ConfigureRole(modelBuilder);
            ConfigureUser(modelBuilder); // Agregar esta línea
        }

        private void ConfigureSupplier(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Supplier>()
                .Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<Supplier>()
                .Property(p => p.Contact)
                .HasMaxLength(100);

            modelBuilder.Entity<Supplier>()
                .Property(p => p.Phone)
                .HasMaxLength(20);

            modelBuilder.Entity<Supplier>()
                .Property(p => p.Email)
                .HasMaxLength(100);

            modelBuilder.Entity<Supplier>()
                .Property(p => p.Address)
                .HasMaxLength(255);
        }

        private void ConfigureRole(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Role>()
                .Property(r => r.RoleName)
                .IsRequired()
                .HasMaxLength(50);

            modelBuilder.Entity<Role>()
                .Property(r => r.Description)
                .HasMaxLength(255);

            modelBuilder.Entity<Role>()
                .Property(r => r.IsActive)
                .HasDefaultValue(true);
        }

        private void ConfigureUser(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .Property(u => u.Name)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<User>()
                .Property(u => u.Username)
                .IsRequired()
                .HasMaxLength(50);

            modelBuilder.Entity<User>()
                .Property(u => u.Password)
                .IsRequired()
                .HasMaxLength(255);

            modelBuilder.Entity<User>()
                .Property(u => u.Email)
                .HasMaxLength(100);

            modelBuilder.Entity<User>()
                .Property(u => u.CreatedAt)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<User>()
                .Property(u => u.IsActive)
                .HasDefaultValue(true);
        }
    }
}
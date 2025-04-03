using Microsoft.EntityFrameworkCore;
using proyectInvetoryDSI.Models;
using proyectInvetoryDSI.Data;

namespace proyectInvetoryDSI.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; } // Agregar esta línea
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<SaleDetail> SaleDetails { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Inventory> Inventories { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureSupplier(modelBuilder);
            ConfigureRole(modelBuilder);
            ConfigureUser(modelBuilder); // Agregar esta línea
            ConfigureCustomer(modelBuilder);
            ConfigureSale(modelBuilder);
            ConfigureSaleDetail(modelBuilder);
            ConfigureProduct(modelBuilder);
            ConfigureInventory(modelBuilder);
   
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

            // Definir la relación con Role
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany()
                .HasForeignKey(u => u.RoleID)
                .OnDelete(DeleteBehavior.Restrict); // Evita eliminación en cascada
        }


        // Dashboard Cofiguration 
            private void ConfigureCustomer(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Customer>()
                .Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<Customer>()
                .Property(c => c.Phone)
                .HasMaxLength(20);

            modelBuilder.Entity<Customer>()
                .Property(c => c.Email)
                .HasMaxLength(100);

            modelBuilder.Entity<Customer>()
                .Property(c => c.Address)
                .HasMaxLength(255);
        }

        private void ConfigureSale(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Sale>()
                .Property(s => s.SaleDate)
                .IsRequired();

            modelBuilder.Entity<Sale>()
                .Property(s => s.TotalAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Sale>()
                .HasOne(s => s.Customer)
                .WithMany()
                .HasForeignKey(s => s.CustomerID);

            modelBuilder.Entity<Sale>()
                .HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.UserID);
        }

        private void ConfigureSaleDetail(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<SaleDetail>()
                .Property(sd => sd.UnitPrice)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<SaleDetail>()
                .Property(sd => sd.Subtotal)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<SaleDetail>()
                .HasOne(sd => sd.Sale)
                .WithMany(s => s.SaleDetails)
                .HasForeignKey(sd => sd.SaleID);

            modelBuilder.Entity<SaleDetail>()
                .HasOne(sd => sd.Product)
                .WithMany()
                .HasForeignKey(sd => sd.ProductID);
        }

        private void ConfigureProduct(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Product>()
                .Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<Product>()
                .Property(p => p.Description)
                .HasMaxLength(500);

            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasColumnType("decimal(18,2)");

                        // Agrega esta configuración para el campo Barcode
            modelBuilder.Entity<Product>()
                .Property(p => p.Barcode)
                .HasMaxLength(50); // Ajusta la longitud según tus necesidades

            modelBuilder.Entity<Product>()
                .Property(p => p.StockQuantity)
                .IsRequired();


            modelBuilder.Entity<Product>()
                .HasOne(p => p.Supplier)
                .WithMany()
                .HasForeignKey(p => p.SupplierID);
        }

        private void ConfigureInventory(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Inventory>()
                .Property(i => i.LastUpdated)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<Inventory>()
                .HasOne(i => i.Product)
                .WithMany()
                .HasForeignKey(i => i.ProductID);
        }


    }
}
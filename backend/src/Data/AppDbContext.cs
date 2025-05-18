using Microsoft.EntityFrameworkCore;
using proyectInvetoryDSI.Models;

namespace proyectInvetoryDSI.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Supplier> Suppliers { get; set; } = null!;
        public DbSet<Role> Roles { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Customer> Customers { get; set; } = null!;
        public DbSet<Sale> Sales { get; set; } = null!;
        public DbSet<SaleDetail> SaleDetails { get; set; } = null!;
        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<Inventory> Inventories { get; set; } = null!;
        public DbSet<InventoryTransaction> InventoryTransactions { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Purchase> Purchases { get; set; } = null!;
        public DbSet<PurchaseDetail> PurchaseDetails { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureSupplier(modelBuilder);
            ConfigureRole(modelBuilder);
            ConfigureUser(modelBuilder);
            ConfigureCustomer(modelBuilder);
            ConfigureSale(modelBuilder);
            ConfigureSaleDetail(modelBuilder);
            ConfigureProduct(modelBuilder);
            ConfigureInventory(modelBuilder);
            ConfigureInventoryTransaction(modelBuilder);
            ConfigureCategory(modelBuilder);
            ConfigurePurchase(modelBuilder);
            ConfigurePurchaseDetail(modelBuilder);
            ConfigureNotification(modelBuilder);
        }

        private void ConfigureSupplier(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Supplier>()
                .Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<Supplier>()
                .Property(p => p.Contact)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<Supplier>()
                .Property(p => p.Phone)
                .IsRequired()
                .HasMaxLength(20);

            modelBuilder.Entity<Supplier>()
                .Property(p => p.Email)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<Supplier>()
                .Property(p => p.Address)
                .IsRequired()
                .HasMaxLength(255);

            modelBuilder.Entity<Supplier>()
                .Property(p => p.Status)
                .HasMaxLength(20)
                .HasDefaultValue("active");

            modelBuilder.Entity<Supplier>()
                .Property(p => p.Category)
                .IsRequired()
                .HasMaxLength(50);
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

            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany()
                .HasForeignKey(u => u.RoleID)
                .OnDelete(DeleteBehavior.Restrict);
        }

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

            modelBuilder.Entity<Customer>()
                .Property(c => c.Gender)
                .HasMaxLength(20);

            modelBuilder.Entity<Customer>()
                .Property(c => c.Insurance)
                .HasMaxLength(100);

            modelBuilder.Entity<Customer>()
                .Property(c => c.Status)
                .HasMaxLength(20)
                .HasDefaultValue("active");

            modelBuilder.Entity<Customer>()
                .Property(c => c.Allergies)
                .HasMaxLength(500);

            modelBuilder.Entity<Customer>()
                .Property(c => c.Notes)
                .HasMaxLength(1000);
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
                .WithMany(c => c.Sales)
                .HasForeignKey(s => s.CustomerID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Sale>()
                .HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.UserID)
                .OnDelete(DeleteBehavior.Restrict);
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
                .HasForeignKey(sd => sd.SaleID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SaleDetail>()
                .HasOne(sd => sd.Product)
                .WithMany()
                .HasForeignKey(sd => sd.ProductID)
                .OnDelete(DeleteBehavior.Restrict);
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

            modelBuilder.Entity<Product>()
                .Property(p => p.Barcode)
                .HasMaxLength(100);

            modelBuilder.Entity<Product>()
                .Property(p => p.StockQuantity)
                .IsRequired();

            modelBuilder.Entity<Product>()
                .Property(p => p.SKU)
                .HasMaxLength(50);

            modelBuilder.Entity<Product>()
                .Property(p => p.Location)
                .HasMaxLength(100);

            modelBuilder.Entity<Product>()
                .Property(p => p.Status)
                .HasMaxLength(20)
                .HasDefaultValue("in-stock");

            modelBuilder.Entity<Product>()
                .Property(p => p.CreatedAt)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<Product>()
                .Property(p => p.LastUpdated)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<Product>()
                .HasOne(p => p.Supplier)
                .WithMany(s => s.Products)
                .HasForeignKey(p => p.SupplierID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Product>()
                .HasOne(p => p.Creator)
                .WithMany()
                .HasForeignKey(p => p.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Product>()
                .HasMany(p => p.InventoryTransactions)
                .WithOne(it => it.Product)
                .HasForeignKey(it => it.ProductID)
                .OnDelete(DeleteBehavior.Cascade);
        }

        private void ConfigureInventory(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Inventory>()
                .Property(i => i.LastUpdated)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<Inventory>()
                .HasOne(i => i.Product)
                .WithMany()
                .HasForeignKey(i => i.ProductID)
                .OnDelete(DeleteBehavior.Cascade);
        }

        private void ConfigureInventoryTransaction(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<InventoryTransaction>()
                .Property(it => it.TransactionType)
                .IsRequired()
                .HasMaxLength(50);

            modelBuilder.Entity<InventoryTransaction>()
                .Property(it => it.TransactionDate)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<InventoryTransaction>()
                .HasOne(it => it.Product)
                .WithMany(p => p.InventoryTransactions)
                .HasForeignKey(it => it.ProductID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InventoryTransaction>()
                .HasOne(it => it.User)
                .WithMany()
                .HasForeignKey(it => it.UserID)
                .OnDelete(DeleteBehavior.Restrict);
        }

        private void ConfigureCategory(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Category>()
                .Property(c => c.CategoryName)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<Category>()
                .Property(c => c.Description)
                .HasMaxLength(255);

            modelBuilder.Entity<Category>()
                .Property(c => c.IsActive)
                .HasDefaultValue(true);

            modelBuilder.Entity<Category>()
                .HasMany(c => c.Products)
                .WithOne(p => p.Category)
                .HasForeignKey(p => p.CategoryID)
                .OnDelete(DeleteBehavior.Restrict);
        }

        private void ConfigurePurchase(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Purchase>()
                .Property(p => p.PurchaseDate)
                .IsRequired();

            modelBuilder.Entity<Purchase>()
                .Property(p => p.TotalAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Purchase>()
                .HasOne(p => p.Supplier)
                .WithMany(s => s.Purchases)
                .HasForeignKey(p => p.SupplierID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Purchase>()
                .HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Purchase>()
                .HasMany(p => p.PurchaseDetails)
                .WithOne(pd => pd.Purchase)
                .HasForeignKey(pd => pd.PurchaseID)
                .OnDelete(DeleteBehavior.Cascade);
        }

        private void ConfigurePurchaseDetail(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PurchaseDetail>()
                .Property(pd => pd.UnitPrice)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<PurchaseDetail>()
                .Property(pd => pd.Subtotal)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<PurchaseDetail>()
                .HasOne(pd => pd.Purchase)
                .WithMany(p => p.PurchaseDetails)
                .HasForeignKey(pd => pd.PurchaseID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PurchaseDetail>()
                .HasOne(pd => pd.Product)
                .WithMany()
                .HasForeignKey(pd => pd.ProductID)
                .OnDelete(DeleteBehavior.Restrict);
        }

        private void ConfigureNotification(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Notification>()
                .Property(n => n.Id)
                .HasMaxLength(50);

            modelBuilder.Entity<Notification>()
                .Property(n => n.Title)
                .IsRequired()
                .HasMaxLength(200);

            modelBuilder.Entity<Notification>()
                .Property(n => n.Message)
                .IsRequired()
                .HasMaxLength(1000);

            modelBuilder.Entity<Notification>()
                .Property(n => n.Type)
                .IsRequired()
                .HasMaxLength(20);

            modelBuilder.Entity<Notification>()
                .Property(n => n.Category)
                .HasMaxLength(50);

            modelBuilder.Entity<Notification>()
                .Property(n => n.EntityId)
                .HasMaxLength(50);

            modelBuilder.Entity<Notification>()
                .Property(n => n.EntityType)
                .HasMaxLength(50);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
using Microsoft.EntityFrameworkCore;
using NdisPortal.BookingsApi.Models; // Ensure your models are updated to match

namespace NdisPortal.BookingsApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
        public DbSet<ServiceItem> Services => Set<ServiceItem>();
        public DbSet<Booking> Bookings => Set<Booking>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // --- Table Mappings (Snake Case) ---
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<ServiceCategory>().ToTable("service_categories");
            modelBuilder.Entity<ServiceItem>().ToTable("services");
            modelBuilder.Entity<Booking>().ToTable("bookings");

            // --- ServiceItem Relationships ---
            modelBuilder.Entity<ServiceItem>(entity =>
            {
                entity.HasOne(s => s.ServiceCategory)
                    .WithMany(c => c.Services)
                    .HasForeignKey(s => s.CategoryId) 
                    .HasConstraintName("fk_services_service_category")
                    .OnDelete(DeleteBehavior.Restrict);
                
                // Map the FK column specifically to snake_case if the property is PascalCase
                entity.Property(s => s.CategoryId).HasColumnName("category_id");
            });

            // --- Booking Relationships ---
            modelBuilder.Entity<Booking>(entity =>
            {
                // User Relationship
                entity.HasOne(b => b.User)
                    .WithMany()
                    .HasForeignKey(b => b.UserId)
                    .HasConstraintName("fk_bookings_user")
                    .OnDelete(DeleteBehavior.Restrict);
                entity.Property(b => b.UserId).HasColumnName("user_id");

                // Service Relationship
                entity.HasOne(b => b.Service)
                    .WithMany()
                    .HasForeignKey(b => b.ServiceId)
                    .HasConstraintName("fk_bookings_service")
                    .OnDelete(DeleteBehavior.Restrict);
                entity.Property(b => b.ServiceId).HasColumnName("service_id");

                // Status Check Constraint
                entity.ToTable(t => t.HasCheckConstraint("chk_booking_status", "status IN (0,1,2)"));
            });
        }
    }
}
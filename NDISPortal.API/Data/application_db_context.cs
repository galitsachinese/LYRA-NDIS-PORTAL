using Microsoft.EntityFrameworkCore;

using NDIS.API.Model;

using NdisPortal.BookingsApi.Models;

using NDISPortal.API.Models;

using Register.API.Models;

using Service.API.Model;



namespace NDISPortal.API.Data

{

    public class application_db_context : DbContext

    {

        public application_db_context(DbContextOptions<application_db_context> options) : base(options) { }



        public DbSet<User> Users => Set<User>();

        public DbSet<ServiceCategory> service_categories => Set<ServiceCategory>();

        public DbSet<ServiceItem> Services => Set<ServiceItem>();

        public DbSet<Booking> Bookings => Set<Booking>();

        

        public DbSet<SupportWorkers> SupportWorker => Set<SupportWorkers>();

        public DbSet<WorkerBooking> WorkerBookings => Set<WorkerBooking>();
        public DbSet<ContactEnquiry> ContactInquiries => Set<ContactEnquiry>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)

        {

            base.OnModelCreating(modelBuilder);



            // --- Service Category Mapping ---

            modelBuilder.Entity<ServiceCategory>(entity =>

            {

                entity.ToTable("service_categories");

                entity.HasKey(c => c.Id);



                entity.Property(c => c.Id).HasColumnName("id");

                entity.Property(c => c.Name).HasColumnName("name");

                // Ignore Description property since database doesn't have this column

                entity.Ignore(c => c.Description);

            });



            // --- ServiceItem Mapping ---

            modelBuilder.Entity<ServiceItem>(entity =>

            {

                entity.ToTable("services");



                entity.HasKey(s => s.Id);



                entity.Property(s => s.Id).HasColumnName("id");

                entity.Property(s => s.CategoryId).HasColumnName("category_id");

                entity.Property(s => s.Name).HasColumnName("name");

                entity.Property(s => s.Description).HasColumnName("description");

                entity.Property(s => s.is_active).HasColumnName("is_active");

                entity.Property(s => s.created_date).HasColumnName("created_date");

                entity.Property(s => s.modified_date).HasColumnName("modified_date");



                entity.HasOne(s => s.ServiceCategory)

                    .WithMany(c => c.Services)

                    .HasForeignKey(s => s.CategoryId)

                    .HasConstraintName("FK_Services_ServiceCategories")

                    .OnDelete(DeleteBehavior.Restrict);

            });



            // --- Booking Mapping ---

            modelBuilder.Entity<Booking>(entity =>

            {

                entity.ToTable("bookings");



                entity.HasKey(b => b.Id);



                entity.Property(b => b.Id).HasColumnName("id");

                entity.Property(b => b.UserId).HasColumnName("user_id");

                entity.Property(b => b.ServiceId).HasColumnName("service_id");

                entity.Property(b => b.BookingDate).HasColumnName("booking_date");

                entity.Property(b => b.Notes).HasColumnName("notes");

                entity.Property(b => b.Status).HasColumnName("status");

                entity.Property(b => b.CreatedDate).HasColumnName("created_date");

                entity.Property(b => b.ModifiedDate).HasColumnName("modified_date");



                entity.HasOne(b => b.User)

                    .WithMany()

                    .HasForeignKey(b => b.UserId)

                    .HasConstraintName("FK_Bookings_Users")

                    .OnDelete(DeleteBehavior.Restrict);



                entity.HasOne(b => b.Service)

                    .WithMany()

                    .HasForeignKey(b => b.ServiceId)

                    .HasConstraintName("FK_Bookings_Services")

                    .OnDelete(DeleteBehavior.Restrict);



                entity.ToTable(t => t.HasCheckConstraint("CHK_Booking_Status", "[status] IN (0,1,2)"));

            });



            // --- Support Worker Mapping ---

            modelBuilder.Entity<SupportWorkers>(entity =>

            {

                entity.ToTable("support_workers");

                entity.HasKey(sw => sw.Id);

                entity.Property(sw => sw.Id).HasColumnName("id");

                entity.Property(sw => sw.ServiceId).HasColumnName("service_id");

                entity.Property(sw => sw.FirstName).HasColumnName("first_name");

                entity.Property(sw => sw.LastName).HasColumnName("last_name");

                entity.Property(sw => sw.Email).HasColumnName("email");

                entity.Property(sw => sw.Phone).HasColumnName("phone");

                entity.Property(sw => sw.Status).HasColumnName("status");

                entity.Property(sw => sw.EmploymentType).HasColumnName("employment_type");

                entity.Property(sw => sw.WwccExpiryDate).HasColumnName("wwcc_expiry_date");

                entity.Property(sw => sw.CreatedDate).HasColumnName("created_date");

                entity.Property(sw => sw.ModifiedDate).HasColumnName("modified_date");

                entity.HasOne(sw => sw.AssignedService)

                    .WithMany()

                    .HasForeignKey(sw => sw.ServiceId)

                    .HasConstraintName("FK_SupportWorkers_Services")

                    .OnDelete(DeleteBehavior.Restrict);

                entity.ToTable(t =>

                {

                    t.HasCheckConstraint("CHK_support_workers_status", "[status] IN ('Active','Inactive','On Leave')");

                    t.HasCheckConstraint("CHK_support_workers_employment_type", "[employment_type] IN ('Full Time','Part Time','Casual','Contractor','Permanent')");

                });

            });



            // --- Contact Enquiry Mapping ---
            modelBuilder.Entity<ContactEnquiry>(entity =>
            {
                entity.ToTable("contact_inquiries");

                entity.HasKey(c => c.Id);

                entity.Property(c => c.Id).HasColumnName("id");
                entity.Property(c => c.FirstName).HasColumnName("first_name");
                entity.Property(c => c.LastName).HasColumnName("last_name");
                entity.Property(c => c.Email).HasColumnName("email");
                entity.Property(c => c.PhoneNumber).HasColumnName("phone_number");
                entity.Property(c => c.Message).HasColumnName("message");
                entity.Property(c => c.IsRead).HasColumnName("is_read");
                entity.Property(c => c.SubmittedAt).HasColumnName("submitted_at");
            });

            // --- Worker Booking Mapping ---

            modelBuilder.Entity<WorkerBooking>(entity =>

            {

                entity.ToTable("worker_bookings");

                entity.HasKey(wb => wb.Id);

                entity.Property(wb => wb.Id).HasColumnName("id");

                entity.Property(wb => wb.WorkerId).HasColumnName("worker_id");

                entity.Property(wb => wb.BookingId).HasColumnName("booking_id");

                entity.Property(wb => wb.AssignedDate).HasColumnName("assigned_date");

                entity.Property(wb => wb.ModifiedDate).HasColumnName("modified_date");

                entity.Property(wb => wb.AssignedBy).HasColumnName("assigned_by");

                entity.HasIndex(wb => wb.BookingId)

                    .IsUnique()

                    .HasDatabaseName("UQ_worker_bookings_booking");

                entity.HasOne(wb => wb.Worker)

                    .WithMany()

                    .HasForeignKey(wb => wb.WorkerId)

                    .HasConstraintName("FK_worker_bookings_worker")

                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(wb => wb.Booking)

                    .WithMany()

                    .HasForeignKey(wb => wb.BookingId)

                    .HasConstraintName("FK_worker_bookings_booking")

                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(wb => wb.AssignedByUser)

                    .WithMany()

                    .HasForeignKey(wb => wb.AssignedBy)

                    .HasConstraintName("FK_worker_bookings_assigned_by")

                    .OnDelete(DeleteBehavior.Restrict);

            });

        }

    }

}

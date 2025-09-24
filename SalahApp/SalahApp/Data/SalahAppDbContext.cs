using Microsoft.EntityFrameworkCore;
using SalahApp.Models;

namespace SalahApp.Data
{
    public class SalahAppDbContext : DbContext
    {
        public SalahAppDbContext(DbContextOptions<SalahAppDbContext> options) : base(options)
        {
        }

        // DbSets
        public DbSet<Admin> Admins { get; set; }
        public DbSet<State> States { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<Masjid> Masjids { get; set; }
        public DbSet<SalahTiming> SalahTimings { get; set; }
        public DbSet<DailyAdditionalTimings> DailyAdditionalTimings { get; set; }
        public DbSet<SpecialEvents> SpecialEvents { get; set; }
        public DbSet<DefaultSchedule> DefaultSchedules { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure State entity
            modelBuilder.Entity<State>(entity =>
            {
                entity.HasKey(e => e.StateId);
                entity.Property(e => e.StateName).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.StateName).IsUnique();
            });

            // Configure City entity
            modelBuilder.Entity<City>(entity =>
            {
                entity.HasKey(e => e.CityId);
                entity.Property(e => e.CityName).IsRequired().HasMaxLength(100);
                
                entity.HasOne(e => e.State)
                    .WithMany(s => s.Cities)
                    .HasForeignKey(e => e.StateId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.CityName, e.StateId }).IsUnique();
            });

            // Configure Masjid entity
            modelBuilder.Entity<Masjid>(entity =>
            {
                entity.HasKey(e => e.MasjidId);
                entity.Property(e => e.MasjidName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Address).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Latitude).HasPrecision(10, 8);
                entity.Property(e => e.Longitude).HasPrecision(11, 8);
                entity.Property(e => e.ContactNumber).HasMaxLength(20);
                entity.Property(e => e.ImamName).HasMaxLength(100);

                entity.HasOne(e => e.City)
                    .WithMany(c => c.Masjids)
                    .HasForeignKey(e => e.CityId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.MasjidName, e.CityId }).IsUnique();
            });

            // Configure Admin entity
            modelBuilder.Entity<Admin>(entity =>
            {
                entity.HasKey(e => e.AdminId);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(20).HasDefaultValue("Admin");

                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Configure SalahTiming entity
            modelBuilder.Entity<SalahTiming>(entity =>
            {
                entity.HasKey(e => e.SalahId);
                
                entity.HasOne(e => e.Masjid)
                    .WithMany(m => m.SalahTimings)
                    .HasForeignKey(e => e.MasjidId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.MasjidId, e.Date }).IsUnique();
            });

            // Configure DailyAdditionalTimings entity
            modelBuilder.Entity<DailyAdditionalTimings>(entity =>
            {
                entity.HasKey(e => e.AdditionalId);
                
                entity.HasOne(e => e.Masjid)
                    .WithMany(m => m.DailyAdditionalTimings)
                    .HasForeignKey(e => e.MasjidId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.MasjidId, e.Date }).IsUnique();
            });

            // Configure SpecialEvents entity
            modelBuilder.Entity<SpecialEvents>(entity =>
            {
                entity.HasKey(e => e.EventId);
                entity.Property(e => e.EventName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(1000);
                
                entity.HasOne(e => e.Masjid)
                    .WithMany(m => m.SpecialEvents)
                    .HasForeignKey(e => e.MasjidId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure DefaultSchedule entity
            modelBuilder.Entity<DefaultSchedule>(entity =>
            {
                entity.HasKey(e => e.ScheduleId);
                
                entity.HasOne(e => e.Masjid)
                    .WithOne(m => m.DefaultSchedule)
                    .HasForeignKey<DefaultSchedule>(ds => ds.MasjidId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.MasjidId).IsUnique();
            });

            // Seed initial data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed some initial states
            modelBuilder.Entity<State>().HasData(
                new State { StateId = 1, StateName = "Andhra Pradesh" },
                new State { StateId = 2, StateName = "Telangana" },
                new State { StateId = 3, StateName = "Karnataka" },
                new State { StateId = 4, StateName = "Tamil Nadu" },
                new State { StateId = 5, StateName = "Kerala" },
                new State { StateId = 6, StateName = "Maharashtra" },
                new State { StateId = 7, StateName = "Gujarat" },
                new State { StateId = 8, StateName = "Rajasthan" },
                new State { StateId = 9, StateName = "Uttar Pradesh" },
                new State { StateId = 10, StateName = "Bihar" },
                new State { StateId = 11, StateName = "West Bengal" },
                new State { StateId = 12, StateName = "Odisha" },
                new State { StateId = 13, StateName = "Madhya Pradesh" },
                new State { StateId = 14, StateName = "Delhi" },
                new State { StateId = 15, StateName = "Punjab" },
                new State { StateId = 16, StateName = "Haryana" },
                new State { StateId = 17, StateName = "Himachal Pradesh" },
                new State { StateId = 18, StateName = "Uttarakhand" },
                new State { StateId = 19, StateName = "Jammu and Kashmir" },
                new State { StateId = 20, StateName = "Assam" }
            );

            // Seed some major cities
            modelBuilder.Entity<City>().HasData(
                // Andhra Pradesh
                new City { CityId = 1, CityName = "Hyderabad", StateId = 1 },
                new City { CityId = 2, CityName = "Visakhapatnam", StateId = 1 },
                new City { CityId = 3, CityName = "Vijayawada", StateId = 1 },
                
                // Telangana
                new City { CityId = 4, CityName = "Warangal", StateId = 2 },
                new City { CityId = 5, CityName = "Nizamabad", StateId = 2 },
                
                // Karnataka
                new City { CityId = 6, CityName = "Bangalore", StateId = 3 },
                new City { CityId = 7, CityName = "Mysore", StateId = 3 },
                new City { CityId = 8, CityName = "Mangalore", StateId = 3 },
                
                // Tamil Nadu
                new City { CityId = 9, CityName = "Chennai", StateId = 4 },
                new City { CityId = 10, CityName = "Coimbatore", StateId = 4 },
                new City { CityId = 11, CityName = "Madurai", StateId = 4 },
                
                // Kerala
                new City { CityId = 12, CityName = "Kochi", StateId = 5 },
                new City { CityId = 13, CityName = "Thiruvananthapuram", StateId = 5 },
                new City { CityId = 14, CityName = "Kozhikode", StateId = 5 },
                
                // Maharashtra
                new City { CityId = 15, CityName = "Mumbai", StateId = 6 },
                new City { CityId = 16, CityName = "Pune", StateId = 6 },
                new City { CityId = 17, CityName = "Nagpur", StateId = 6 },
                
                // Delhi
                new City { CityId = 18, CityName = "New Delhi", StateId = 14 },
                
                // Uttar Pradesh
                new City { CityId = 19, CityName = "Lucknow", StateId = 9 },
                new City { CityId = 20, CityName = "Kanpur", StateId = 9 },
                new City { CityId = 21, CityName = "Agra", StateId = 9 }
            );

            // Seed default admin with static hashed password
            modelBuilder.Entity<Admin>().HasData(
                new Admin 
                { 
                    AdminId = 1, 
                    Username = "admin", 
                    // Static BCrypt hash for "admin123" (cost factor 10)
                    PasswordHash = "$2a$10$8K1p/a0dL2LkWBD/TUIxPeZz5Hl0yl9Cp8S4SqZ9oCJJlUn9k8UZG", 
                    Email = "admin@salahapp.com", 
                    Role = "SuperAdmin",
                    CreatedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );
        }
    }
}
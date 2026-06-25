using Domains.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructures.Persistence
{
    public class AuthDbContext : IdentityDbContext<IdentityUser<Guid>, IdentityRole<Guid>, Guid>
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options) { }

        public DbSet<AppAccess> AppAccesses => Set<AppAccess>();
        public DbSet<ModuleAccess> ModuleAccesses => Set<ModuleAccess>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // TPH Discriminator
            builder.Entity<IdentityUser<Guid>>()
                .HasDiscriminator<string>("UserType")
                .HasValue<IdentityUser<Guid>>("Base")
                .HasValue<ErpUser>("ErpUser")
                .HasValue<Customer>("Customer");

            // ErpUser
            builder.Entity<ErpUser>(e =>
            {
                e.Property(u => u.FirstName).HasMaxLength(100).IsRequired();
                e.Property(u => u.LastName).HasMaxLength(100).IsRequired();
            });

            // Customer
            builder.Entity<Customer>(e =>
            {
                e.Property(u => u.FirstName).HasMaxLength(100).IsRequired();
                e.Property(u => u.LastName).HasMaxLength(100).IsRequired();
            });

            // AppAccess
            builder.Entity<AppAccess>(e =>
            {
                e.HasKey(a => a.Id);
                e.Property(a => a.AppName).HasMaxLength(100).IsRequired();
                e.HasOne(a => a.ErpUser)
                    .WithMany(u => u.AppAccesses)
                    .HasForeignKey(a => a.ErpUserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ModuleAccess
            builder.Entity<ModuleAccess>(e =>
            {
                e.HasKey(m => m.Id);
                e.Property(m => m.ModuleName).HasMaxLength(100).IsRequired();
                e.HasOne(m => m.AppAccess)
                    .WithMany(a => a.Modules)
                    .HasForeignKey(m => m.AppAccessId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // RefreshToken — no FK constraint, scoped by TokenType
            builder.Entity<RefreshToken>(e =>
            {
                e.HasKey(r => r.Id);
                e.Property(r => r.Token).HasMaxLength(500).IsRequired();
                e.Property(r => r.ReplacedByToken).HasMaxLength(500);
                e.HasIndex(r => r.Token);
                e.HasIndex(r => new { r.UserId, r.TokenType });
            });
        }
    }
}
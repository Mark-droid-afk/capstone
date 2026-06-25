using Domains.Entities;
using Microsoft.AspNetCore.Identity;

namespace Infrastructures.Persistence
{
    public static class DevSeeder
    {
        public static async Task SeedAsync(
            UserManager<ErpUser> erpUserManager,
            UserManager<Customer> customerManager,
            RoleManager<IdentityRole<Guid>> roleManager,
            AuthDbContext db)
        {
            // Roles
            string[] roles = ["Admin", "Employee", "Customer"];
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole<Guid> { Id = Guid.NewGuid(), Name = role });
            }

            // Admin
            var adminEmail = Environment.GetEnvironmentVariable("SEED_ADMIN_EMAIL") ?? "admin@r3b2p.com";
            var adminPassword = Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD") ?? "Admin@123456";
            var adminUsername = Environment.GetEnvironmentVariable("SEED_ADMIN_USERNAME") ?? "ERP-ADMIN";

            if (await erpUserManager.FindByEmailAsync(adminEmail) is null)
            {
                var admin = new ErpUser
                {
                    Id = Guid.NewGuid(),
                    UserName = adminUsername,
                    Email = adminEmail,
                    FirstName = "System",
                    LastName = "Admin",
                    EmailConfirmed = true,
                    IsActive = true,
                    MustChangePassword = false
                };

                var result = await erpUserManager.CreateAsync(admin, adminPassword);
                if (!result.Succeeded)
                {
                    Console.WriteLine($"❌ Failed to create admin: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                    return;
                }

                await erpUserManager.AddToRoleAsync(admin, "Admin");

                var adminApps = new[]
                {
                    ("point-of-sale",     new[] { "Sales Processing", "Order Management" }),
                    ("supply-chain",      new[] { "Resources & Suppliers", "Orders and Procurement", "Inventory", "Production & Quality", "Distribution & Analytics" }),
                    ("customer-relation", new[] { "Customer Profiles", "Campaigns", "Conversations", "Tickets" }),
                    ("hr-management",     new[] { "Recruitment & Hiring", "Digital 201 Files", "Attendance & Biometrics", "Payroll & Deductions", "User Roles" }),
                    ("settings",          new[] { "User Management", "IAM & Access Control", "Product Configuration" }),
                };

                foreach (var (appName, modules) in adminApps)
                {
                    db.AppAccesses.Add(new AppAccess
                    {
                        Id = Guid.NewGuid(),
                        ErpUserId = admin.Id,
                        AppName = appName,
                        Modules = modules.Select(m => new ModuleAccess
                        {
                            Id = Guid.NewGuid(),
                            ModuleName = m,
                            CanRead = true,
                            CanWrite = true,
                            CanDelete = true,
                            CanExport = true
                        }).ToList()
                    });
                }

                await db.SaveChangesAsync();
                Console.WriteLine($"✅ Admin created: {adminUsername} ({adminEmail})");
            }
            else
            {
                Console.WriteLine($"ℹ️ Admin already exists, skipping.");
            }


            var crmManager = new
            {
                FirstName = "CRM",
                LastName = "Manager",
                Email = Environment.GetEnvironmentVariable("SEED_CRM_MANAGER_EMAIL") ?? "crm@r3b2p.com",
                Password = Environment.GetEnvironmentVariable("SEED_CRM_MANAGER_PASSWORD") ?? "Crm@123456",
                Username = Environment.GetEnvironmentVariable("SEED_CRM_MANAGER_USERNAME") ?? "CRM-MANAGER",
            };

            if (await erpUserManager.FindByEmailAsync(crmManager.Email) is null)
            {
                var user = new ErpUser
                {
                    Id = Guid.NewGuid(),
                    UserName = crmManager.Username,
                    Email = crmManager.Email,
                    FirstName = crmManager.FirstName,
                    LastName = crmManager.LastName,
                    EmailConfirmed = true,
                    IsActive = true,
                    MustChangePassword = false
                };

                var result = await erpUserManager.CreateAsync(user, crmManager.Password);
                if (!result.Succeeded)
                {
                    Console.WriteLine($"❌ Failed to create CRM Manager: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
                else
                {
                    await erpUserManager.AddToRoleAsync(user, "Employee");

                    db.AppAccesses.Add(new AppAccess
                    {
                        Id = Guid.NewGuid(),
                        ErpUserId = user.Id,
                        AppName = "customer-relation",
                        Modules =
                        [
                            new() { Id = Guid.NewGuid(), ModuleName = "Customer Profiles",      CanRead = true, CanWrite = true,  CanDelete = false, CanExport = true  },
                new() { Id = Guid.NewGuid(), ModuleName = "Campaigns", CanRead = true, CanWrite = true,  CanDelete = false, CanExport = true  },
                new() { Id = Guid.NewGuid(), ModuleName = "Conversations",     CanRead = true, CanWrite = true,  CanDelete = false, CanExport = false },
                new() { Id = Guid.NewGuid(), ModuleName = "Tickets",     CanRead = true, CanWrite = true,  CanDelete = false, CanExport = false },

            ]
                    });

                    await db.SaveChangesAsync();
                    Console.WriteLine($"✅ CRM Manager created: {crmManager.Username} ({crmManager.Email}) [Employee]");
                }
            }
            else
            {
                Console.WriteLine("ℹ️  CRM Manager already exists, skipping.");
            }

            // Customers
            // Customers
            var customers = new[]
            {
    new { FirstName = "Alice",   LastName = "Johnson", Email = "alice@example.com",   Password = "Customer@123" },
    new { FirstName = "Bob",     LastName = "Lee",     Email = "bob@example.com",     Password = "Customer@123" },
    new { FirstName = "Charlie", LastName = "Brown",   Email = "charlie@example.com", Password = "Customer@123" },
};

            foreach (var c in customers)
            {
                if (await customerManager.FindByEmailAsync(c.Email) is not null) continue;

                var customer = new Customer
                {
                    Id = Guid.NewGuid(),
                    UserName = c.Email,
                    Email = c.Email,
                    FirstName = c.FirstName,
                    LastName = c.LastName,
                    EmailConfirmed = true,
                    IsActive = true
                };

                var result = await customerManager.CreateAsync(customer, c.Password);
                if (!result.Succeeded)
                {
                    Console.WriteLine($"❌ Failed to create customer {c.Email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                    continue;
                }

                await customerManager.AddToRoleAsync(customer, "Customer");
                Console.WriteLine($"✅ Customer created: {c.Email}");
            }
            Console.WriteLine("\n🌱 Seeding complete.");
        }
    }
}
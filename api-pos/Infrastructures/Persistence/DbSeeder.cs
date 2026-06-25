using Microsoft.EntityFrameworkCore;
using Domains.Entities;

namespace Infrastructures.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(PosDbContext db)
    {
        Console.WriteLine("api-pos DbSeeder: Checking if location seed is needed...");

        // Seed Commissary with LocationId = 999 if it does not exist
        if (!await db.Locations.AnyAsync(l => l.LocationId == 999 || l.LocationName == "Commissary"))
        {
            Console.WriteLine("api-pos DbSeeder: Seeding Commissary (LocationId = 999)...");
            try
            {
                await db.Database.ExecuteSqlRawAsync(
                    "INSERT INTO \"Locations\" (\"LocationId\", \"LocationName\", \"LocationType\", \"IsActive\", \"CreatedAt\") " +
                    "VALUES (999, 'Commissary', 'Commissary', true, NOW()) " +
                    "ON CONFLICT (\"LocationId\") DO NOTHING;"
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"api-pos DbSeeder: Failed to seed Commissary: {ex.Message}");
            }
        }

        if (!await db.Locations.AnyAsync(l => l.LocationId != 999))
        {
            Console.WriteLine("api-pos DbSeeder: Seeding locations...");
            
            var locations = new List<Location>
            {
                new() { LocationName = "Antipolo Store Branch", LocationType = "Store", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { LocationName = "Taytay Store Branch", LocationType = "Store", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { LocationName = "SM City Taytay Bazaar", LocationType = "Bazaar", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { LocationName = "SM Center Angono Bazaar", LocationType = "Bazaar", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { LocationName = "SM City Fairview Bazaar", LocationType = "Bazaar", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { LocationName = "Ayala Malls Arca South Bazaar", LocationType = "Bazaar", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { LocationName = "Estancia Capitol Commons Bazaar", LocationType = "Bazaar", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { LocationName = "TriNoma Bazaar", LocationType = "Bazaar", IsActive = true, CreatedAt = DateTime.UtcNow }
            };

            await db.Locations.AddRangeAsync(locations);
            await db.SaveChangesAsync();
            
            Console.WriteLine("api-pos DbSeeder: Locations seeded successfully.");
        }
        else
        {
            Console.WriteLine("api-pos DbSeeder: Locations already seeded.");
        }

        if (!await db.Products.AnyAsync())
        {
            Console.WriteLine("api-pos DbSeeder: Seeding actual products and variations...");

            // 1. Ube Halaya
            var ubeHalaya = new Product
            {
                ProductName = "Ube Halaya",
                ProductCategory = "Desserts",
                IsActive = true,
                SyncedAt = DateTime.UtcNow
            };
            db.Products.Add(ubeHalaya);

            // 2. Ube Jam
            var ubeJam = new Product
            {
                ProductName = "Ube Jam",
                ProductCategory = "Spreads",
                IsActive = true,
                SyncedAt = DateTime.UtcNow
            };
            db.Products.Add(ubeJam);

            await db.SaveChangesAsync();

            // Ube Halaya Variations
            var halayaSmooth = new ProductVariation { ProductId = ubeHalaya.ProductId, VariationName = "Smooth", IsActive = true, SyncedAt = DateTime.UtcNow };
            var halayaTidbits = new ProductVariation { ProductId = ubeHalaya.ProductId, VariationName = "Tidbits", IsActive = true, SyncedAt = DateTime.UtcNow };
            
            // Ube Jam Variations
            var jamSmooth = new ProductVariation { ProductId = ubeJam.ProductId, VariationName = "Smooth", IsActive = true, SyncedAt = DateTime.UtcNow };
            var jamTidbits = new ProductVariation { ProductId = ubeJam.ProductId, VariationName = "Tidbits", IsActive = true, SyncedAt = DateTime.UtcNow };

            db.ProductVariations.AddRange(halayaSmooth, halayaTidbits, jamSmooth, jamTidbits);
            await db.SaveChangesAsync();

            // Pricing
            var prices = new List<ProductPrice>
            {
                new() { VariationId = halayaSmooth.VariationId, Price = 199.00m, IsActive = true, EffectiveFrom = DateTime.UtcNow, CreatedAt = DateTime.UtcNow },
                new() { VariationId = halayaTidbits.VariationId, Price = 199.00m, IsActive = true, EffectiveFrom = DateTime.UtcNow, CreatedAt = DateTime.UtcNow },
                new() { VariationId = jamSmooth.VariationId, Price = 199.00m, IsActive = true, EffectiveFrom = DateTime.UtcNow, CreatedAt = DateTime.UtcNow },
                new() { VariationId = jamTidbits.VariationId, Price = 199.00m, IsActive = true, EffectiveFrom = DateTime.UtcNow, CreatedAt = DateTime.UtcNow }
            };

            db.ProductPrices.AddRange(prices);
            await db.SaveChangesAsync();

            Console.WriteLine("api-pos DbSeeder: Actual products seeded successfully.");
        }
    }
}

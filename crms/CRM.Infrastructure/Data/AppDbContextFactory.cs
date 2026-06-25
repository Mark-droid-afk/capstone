using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace CRM.Infrastructure.Data;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        Env.Load(Path.Combine(Directory.GetCurrentDirectory(), "../CRM.API/.env"));
        
        var connectionString = $"Host={Env.GetString("DB_HOST")};" +
                               $"Database={Env.GetString("DB_NAME")};" +
                               $"Username={Env.GetString("DB_USER")};" +
                               $"Password={Env.GetString("DB_PASSWORD")}";

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new AppDbContext(options);
    }
}
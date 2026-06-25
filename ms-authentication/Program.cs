using Applications.Interfaces;
using Applications.Services;
using Domains.Entities;
using DotNetEnv;
using Infrastructures.Persistence;
using Applications.Services;
using Applications.Interfaces;
using Applications.BackgroundServices;
using Infrastructures.Externals;
using Api.Middlewares;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Scalar.AspNetCore;

Env.Load();

// User Seed
if (args.Contains("--seed"))
{
    var seedApp = WebApplication.CreateBuilder(args).Build();
    // rebuild with services
    var seedBuilder = WebApplication.CreateBuilder(args);
    Env.Load();

    var seedConn =
        $"Host={Environment.GetEnvironmentVariable("POSTGRES_DB_HOST")};" +
        $"Port={Environment.GetEnvironmentVariable("POSTGRES_DB_PORT")};" +
        $"Database=auth_db;" +
        $"Username={Environment.GetEnvironmentVariable("POSTGRES_USERNAME")};" +
        $"Password={Environment.GetEnvironmentVariable("POSTGRES_PASSWORD")}";

    seedBuilder.Services.AddDataProtection();
    seedBuilder.Services.AddDbContext<AuthDbContext>(o => o.UseNpgsql(seedConn));
    seedBuilder.Services.AddIdentityCore<ErpUser>()
        .AddRoles<IdentityRole<Guid>>()
        .AddEntityFrameworkStores<AuthDbContext>()
        .AddDefaultTokenProviders();
    seedBuilder.Services.AddIdentityCore<Customer>()
        .AddRoles<IdentityRole<Guid>>()
        .AddEntityFrameworkStores<AuthDbContext>()
        .AddDefaultTokenProviders();

    var seedHost = seedBuilder.Build();

    using var scope = seedHost.Services.CreateScope();
    var sp = scope.ServiceProvider;

    await DevSeeder.SeedAsync(
        sp.GetRequiredService<UserManager<ErpUser>>(),
        sp.GetRequiredService<UserManager<Customer>>(),
        sp.GetRequiredService<RoleManager<IdentityRole<Guid>>>(),
        sp.GetRequiredService<AuthDbContext>()
    );

    return;
}

var builder = WebApplication.CreateBuilder(args);

// Controllers + Validation
builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();

// Database
var connectionString =
    $"Host={Environment.GetEnvironmentVariable("POSTGRES_DB_HOST")};" +
    $"Port={Environment.GetEnvironmentVariable("POSTGRES_DB_PORT")};" +
    $"Database=auth_db;" +
    $"Username={Environment.GetEnvironmentVariable("POSTGRES_USERNAME")};" +
    $"Password={Environment.GetEnvironmentVariable("POSTGRES_PASSWORD")}";

builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseNpgsql(connectionString));

// Identity
builder.Services.AddIdentityCore<ErpUser>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequiredLength = 8;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.User.RequireUniqueEmail = true;
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<AuthDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddIdentityCore<Customer>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequiredLength = 8;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.SignIn.RequireConfirmedEmail = true;
        options.User.RequireUniqueEmail = true;
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<AuthDbContext>()
    .AddDefaultTokenProviders();

// JWT + Google Auth
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")!;
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")!;
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")!;

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                var erpToken = ctx.Request.Cookies["erp_access_token"];
                var customerToken = ctx.Request.Cookies["customer_access_token"];
                ctx.Token = erpToken ?? customerToken;
                return Task.CompletedTask;
            }
        };
    })
    .AddGoogle(options =>
    {
        options.ClientId = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID")!;
        options.ClientSecret = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET")!;
        options.SignInScheme = IdentityConstants.ExternalScheme;
    });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontends", policy =>
        policy.WithOrigins(
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://localhost:3003",
            "http://localhost:3004",
            "http://localhost:3005"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// App Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<ICookieService, CookieService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IErpAuthService, ErpAuthService>();
builder.Services.AddScoped<ICustomerAuthService, CustomerAuthService>();

builder.Services.AddSingleton<CustomerSyncChannel>();
builder.Services.AddSingleton<CrmClient>();
builder.Services.AddHostedService<CustomerSyncWorker>();

builder.Services.AddHttpClient("CrmApi", client =>
{
    client.BaseAddress = new Uri(Environment.GetEnvironmentVariable("CRM_API_URL")!);
});

builder.Services.AddOpenApi();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var sp = scope.ServiceProvider;
    var db = sp.GetRequiredService<AuthDbContext>();

    await db.Database.MigrateAsync();

    await DevSeeder.SeedAsync(
        sp.GetRequiredService<UserManager<ErpUser>>(),
        sp.GetRequiredService<UserManager<Customer>>(),
        sp.GetRequiredService<RoleManager<IdentityRole<Guid>>>(),
        db
    );
}

// Middleware
if (app.Environment.IsDevelopment())
{
    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference();
    }
}

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseCors("AllowFrontends");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
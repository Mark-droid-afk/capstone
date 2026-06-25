using System.Text;
using DotNetEnv;
using CRM.Application.Interfaces;
using CRM.Application.Services;
using CRM.API.BackgroundServices;
using CRM.Infrastructure.Hubs;
using CRM.Infrastructure.Data;
using CRM.Infrastructure.Email;
using CRM.Infrastructure.Repositories;
using CRM.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

var connectionString = $"Host={Env.GetString("DB_HOST")};" +
                       $"Database={Env.GetString("DB_NAME")};" +
                       $"Username={Env.GetString("DB_USER")};" +
                       $"Password={Env.GetString("DB_PASSWORD")}";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Repositories
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<IMarketingRepository, MarketingRepository>();
builder.Services.AddScoped<ICampaignRepository, CampaignRepository>();

// Services
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IMarketingService, MarketingService>();
builder.Services.AddScoped<ICampaignService, CampaignService>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<ICustomerTicketService, CustomerTicketService>();
builder.Services.AddScoped<IConversationService, ConversationService>();

// Email
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();

// Background jobs
builder.Services.AddHostedService<CampaignSchedulerService>();

// Order proxy via HttpClient
builder.Services.AddHttpClient<IOrderService, OrderService>(client =>
{
    client.BaseAddress = new Uri(Env.GetString("ECOMMERCE_API_URL"));
});

// ── JWT Authentication ───────────────────────────────────────────────────────
var jwtKey    = Env.GetString("JWT_SECRET");
var jwtIssuer = Env.GetString("JWT_ISSUER");
var jwtAud    = Env.GetString("JWT_AUDIENCE");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtIssuer,
            ValidAudience            = jwtAud,
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // 1. Try Authorization header first (standard Bearer token)
                var authHeader = context.Request.Headers["Authorization"].ToString();
                if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    return Task.CompletedTask;
                }

                // 2. Fallback: Read from the HttpOnly cookies sent by customer/agent frontends
                if (context.Request.Cookies.TryGetValue("customer_access_token", out var customerToken))
                {
                    context.Token = customerToken;
                }
                else if (context.Request.Cookies.TryGetValue("erp_access_token", out var erpToken))
                {
                    context.Token = erpToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        // Collect all frontend origins — split on comma so you can list multiple in .env
        var origins = new[]
        {
            "http://localhost:3001",
            "http://localhost:3005"
        };

        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();
app.MapHub<ConversationHub>("/hubs/conversation");
app.Run();
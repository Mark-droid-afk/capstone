using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Customer>         Customers          => Set<Customer>();
    public DbSet<MarketingHistory> MarketingHistories => Set<MarketingHistory>();
    public DbSet<Campaign>         Campaigns          => Set<Campaign>();
    public DbSet<CampaignTemplate> CampaignTemplates  => Set<CampaignTemplate>();
    public DbSet<Ticket>           Tickets            => Set<Ticket>();
    public DbSet<Conversation>     Conversations      => Set<Conversation>();
    public DbSet<Message>          Messages           => Set<Message>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // ── Ticket ───────────────────────────────────────────────────────────
        builder.Entity<Ticket>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Status).HasConversion<string>();
        });

        // ── Conversation ──────────────────────────────────────────────────────
        builder.Entity<Conversation>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasMany(x => x.Messages)
             .WithOne(x => x.Conversation)
             .HasForeignKey(x => x.ConversationId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Message ───────────────────────────────────────────────────────────
        builder.Entity<Message>(e =>
        {
            e.HasKey(x => x.Id);
        });

        // ── Customer ─────────────────────────────────────────────────────────
        builder.Entity<Customer>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Status).HasConversion<string>();
            e.Property(x => x.CustomerType).HasConversion<string>();
            e.HasMany(x => x.MarketingHistories)
             .WithOne(x => x.Customer)
             .HasForeignKey(x => x.CustomerId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasQueryFilter(x => !x.IsDeleted);
        });

        // ── MarketingHistory ─────────────────────────────────────────────────
        builder.Entity<MarketingHistory>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Channel).HasConversion<string>();
            e.Property(x => x.InteractionType).HasConversion<string>();
        });

        // ── CampaignTemplate ─────────────────────────────────────────────────
        builder.Entity<CampaignTemplate>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.HtmlBody).HasColumnType("text");
        });

        // ── Campaign ─────────────────────────────────────────────────────────
        builder.Entity<Campaign>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Channel).HasConversion<string>();
            e.Property(x => x.Status).HasConversion<string>();
            e.Property(x => x.ScheduleType).HasConversion<string>();
            e.Property(x => x.ImageUrl).HasColumnType("text");

            e.HasOne(x => x.Template)
             .WithMany()
             .HasForeignKey(x => x.TemplateId)
             .IsRequired(false)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ── Seed built-in email templates ─────────────────────────────────────
        SeedTemplates(builder);
    }

    private static void SeedTemplates(ModelBuilder builder)
    {
        var t1Id = new Guid("11111111-1111-1111-1111-111111111111");
        var t2Id = new Guid("22222222-2222-2222-2222-222222222222");
        var t3Id = new Guid("33333333-3333-3333-3333-333333333333");
        var seededAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        builder.Entity<CampaignTemplate>().HasData(
            new CampaignTemplate
            {
                Id          = t1Id,
                Name        = "Clean Minimal",
                Description = "Simple white layout — great for updates and announcements.",
                CreatedAt   = seededAt,
                HtmlBody    = """
                    <!DOCTYPE html><html><head><meta charset="utf-8">
                    <meta name="viewport" content="width=device-width,initial-scale=1">
                    <title>{{subject}}</title></head>
                    <body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td align="center" style="padding:40px 16px;">
                    <table width="600" cellpadding="0" cellspacing="0"
                      style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
                    <tr><td>{{imageBlock}}</td></tr>
                    <tr><td style="padding:48px 40px 32px;">
                      <h1 style="margin:0 0 12px;font-size:30px;font-weight:700;color:#111827;line-height:1.2;">{{title}}</h1>
                      <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:.08em;">{{subject}}</p>
                      <hr style="border:none;border-top:1px solid #f0f0f0;margin:20px 0;">
                      <div style="font-size:15px;color:#374151;line-height:1.75;">{{description}}</div>
                    </td></tr>
                    <tr><td style="padding:24px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                        You received this because you are a valued customer.&nbsp;
                        <a href="{{unsubscribeUrl}}" style="color:#9ca3af;">Unsubscribe</a>
                      </p>
                    </td></tr>
                    </table></td></tr></table>
                    </body></html>
                    """
            },
            new CampaignTemplate
            {
                Id          = t2Id,
                Name        = "Bold Promo",
                Description = "Eye-catching dark header with a prominent call-to-action — ideal for promotions.",
                CreatedAt   = seededAt,
                HtmlBody    = """
                    <!DOCTYPE html><html><head><meta charset="utf-8">
                    <meta name="viewport" content="width=device-width,initial-scale=1">
                    <title>{{subject}}</title></head>
                    <body style="margin:0;padding:0;background:#0f172a;font-family:'Helvetica Neue',Arial,sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td align="center" style="padding:40px 16px;">
                    <table width="600" cellpadding="0" cellspacing="0"
                      style="background:#1e293b;border-radius:12px;overflow:hidden;">
                    <tr><td style="padding:48px 40px 32px;text-align:center;">
                      <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#818cf8;text-transform:uppercase;letter-spacing:.12em;">{{subject}}</p>
                      <h1 style="margin:0 0 24px;font-size:36px;font-weight:800;color:#f8fafc;line-height:1.15;">{{title}}</h1>
                    </td></tr>
                    <tr><td>{{imageBlock}}</td></tr>
                    <tr><td style="padding:32px 40px;background:#0f172a;">
                      <div style="font-size:15px;color:#94a3b8;line-height:1.8;margin-bottom:32px;">{{description}}</div>
                      <div style="text-align:center;">
                        <a href="#" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;
                          text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;
                          letter-spacing:.02em;">Get Started</a>
                      </div>
                    </td></tr>
                    <tr><td style="padding:20px 40px;text-align:center;">
                      <p style="margin:0;font-size:12px;color:#475569;">
                        <a href="{{unsubscribeUrl}}" style="color:#475569;">Unsubscribe</a>
                      </p>
                    </td></tr>
                    </table></td></tr></table>
                    </body></html>
                    """
            },
            new CampaignTemplate
            {
                Id          = t3Id,
                Name        = "Newsletter",
                Description = "Professional header, rich content section, and footer — perfect for newsletters.",
                CreatedAt   = seededAt,
                HtmlBody    = """
                    <!DOCTYPE html><html><head><meta charset="utf-8">
                    <meta name="viewport" content="width=device-width,initial-scale=1">
                    <title>{{subject}}</title></head>
                    <body style="margin:0;padding:0;background:#f3f4f6;font-family:'Helvetica Neue',Arial,sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td align="center" style="padding:40px 16px;">
                    <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                    <!-- Header -->
                    <tr><td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 40px;">
                      <h2 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-.01em;">CRM Newsletter</h2>
                      <p style="margin:6px 0 0;font-size:13px;color:#c4b5fd;">{{subject}}</p>
                    </td></tr>
                    <!-- Image -->
                    <tr><td>{{imageBlock}}</td></tr>
                    <!-- Content -->
                    <tr><td style="padding:40px;">
                      <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#111827;">{{title}}</h1>
                      <div style="font-size:15px;color:#374151;line-height:1.8;">{{description}}</div>
                    </td></tr>
                    <tr><td style="padding:0 40px 40px;">
                      <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 28px;">
                      <p style="margin:0;font-size:13px;color:#6b7280;">
                        Thanks for being part of our community. Reply to this email if you have any questions.
                      </p>
                    </td></tr>
                    <!-- Footer -->
                    <tr><td style="padding:24px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                        &copy; 2026 CRM System &bull;
                        <a href="{{unsubscribeUrl}}" style="color:#9ca3af;">Unsubscribe</a>
                      </p>
                    </td></tr>
                    </table></td></tr></table>
                    </body></html>
                    """
            }
        );
    }
}
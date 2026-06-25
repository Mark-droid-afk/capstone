using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Campaigns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CampaignTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    HtmlBody = table.Column<string>(type: "text", nullable: false),
                    PreviewUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CampaignTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Campaigns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Subject = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Channel = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ScheduleType = table.Column<string>(type: "text", nullable: false),
                    ScheduledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RecurringDays = table.Column<string>(type: "text", nullable: true),
                    TemplateId = table.Column<Guid>(type: "uuid", nullable: true),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    SentCount = table.Column<int>(type: "integer", nullable: false),
                    AudienceFilter = table.Column<string>(type: "text", nullable: false),
                    LastSentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Campaigns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Campaigns_CampaignTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "CampaignTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "CampaignTemplates",
                columns: new[] { "Id", "CreatedAt", "Description", "HtmlBody", "Name", "PreviewUrl" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Simple white layout — great for updates and announcements.", "<!DOCTYPE html><html><head><meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>{{subject}}</title></head>\n<body style=\"margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;\">\n<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">\n<tr><td align=\"center\" style=\"padding:40px 16px;\">\n<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\"\n  style=\"background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);\">\n<tr><td>{{imageBlock}}</td></tr>\n<tr><td style=\"padding:48px 40px 32px;\">\n  <h1 style=\"margin:0 0 12px;font-size:30px;font-weight:700;color:#111827;line-height:1.2;\">{{title}}</h1>\n  <p style=\"margin:0 0 12px;font-size:13px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:.08em;\">{{subject}}</p>\n  <hr style=\"border:none;border-top:1px solid #f0f0f0;margin:20px 0;\">\n  <div style=\"font-size:15px;color:#374151;line-height:1.75;\">{{description}}</div>\n</td></tr>\n<tr><td style=\"padding:24px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;\">\n  <p style=\"margin:0;font-size:12px;color:#9ca3af;text-align:center;\">\n    You received this because you are a valued customer.&nbsp;\n    <a href=\"{{unsubscribeUrl}}\" style=\"color:#9ca3af;\">Unsubscribe</a>\n  </p>\n</td></tr>\n</table></td></tr></table>\n</body></html>", "Clean Minimal", null },
                    { new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Eye-catching dark header with a prominent call-to-action — ideal for promotions.", "<!DOCTYPE html><html><head><meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>{{subject}}</title></head>\n<body style=\"margin:0;padding:0;background:#0f172a;font-family:'Helvetica Neue',Arial,sans-serif;\">\n<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">\n<tr><td align=\"center\" style=\"padding:40px 16px;\">\n<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\"\n  style=\"background:#1e293b;border-radius:12px;overflow:hidden;\">\n<tr><td style=\"padding:48px 40px 32px;text-align:center;\">\n  <p style=\"margin:0 0 16px;font-size:12px;font-weight:700;color:#818cf8;text-transform:uppercase;letter-spacing:.12em;\">{{subject}}</p>\n  <h1 style=\"margin:0 0 24px;font-size:36px;font-weight:800;color:#f8fafc;line-height:1.15;\">{{title}}</h1>\n</td></tr>\n<tr><td>{{imageBlock}}</td></tr>\n<tr><td style=\"padding:32px 40px;background:#0f172a;\">\n  <div style=\"font-size:15px;color:#94a3b8;line-height:1.8;margin-bottom:32px;\">{{description}}</div>\n  <div style=\"text-align:center;\">\n    <a href=\"#\" style=\"display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;\n      text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;\n      letter-spacing:.02em;\">Get Started</a>\n  </div>\n</td></tr>\n<tr><td style=\"padding:20px 40px;text-align:center;\">\n  <p style=\"margin:0;font-size:12px;color:#475569;\">\n    <a href=\"{{unsubscribeUrl}}\" style=\"color:#475569;\">Unsubscribe</a>\n  </p>\n</td></tr>\n</table></td></tr></table>\n</body></html>", "Bold Promo", null },
                    { new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Professional header, rich content section, and footer — perfect for newsletters.", "<!DOCTYPE html><html><head><meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>{{subject}}</title></head>\n<body style=\"margin:0;padding:0;background:#f3f4f6;font-family:'Helvetica Neue',Arial,sans-serif;\">\n<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">\n<tr><td align=\"center\" style=\"padding:40px 16px;\">\n<table width=\"620\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#ffffff;border-radius:12px;overflow:hidden;\">\n<!-- Header -->\n<tr><td style=\"background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 40px;\">\n  <h2 style=\"margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-.01em;\">CRM Newsletter</h2>\n  <p style=\"margin:6px 0 0;font-size:13px;color:#c4b5fd;\">{{subject}}</p>\n</td></tr>\n<!-- Image -->\n<tr><td>{{imageBlock}}</td></tr>\n<!-- Content -->\n<tr><td style=\"padding:40px;\">\n  <h1 style=\"margin:0 0 16px;font-size:26px;font-weight:700;color:#111827;\">{{title}}</h1>\n  <div style=\"font-size:15px;color:#374151;line-height:1.8;\">{{description}}</div>\n</td></tr>\n<tr><td style=\"padding:0 40px 40px;\">\n  <hr style=\"border:none;border-top:1px solid #e5e7eb;margin:0 0 28px;\">\n  <p style=\"margin:0;font-size:13px;color:#6b7280;\">\n    Thanks for being part of our community. Reply to this email if you have any questions.\n  </p>\n</td></tr>\n<!-- Footer -->\n<tr><td style=\"padding:24px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;\">\n  <p style=\"margin:0;font-size:12px;color:#9ca3af;text-align:center;\">\n    &copy; 2026 CRM System &bull;\n    <a href=\"{{unsubscribeUrl}}\" style=\"color:#9ca3af;\">Unsubscribe</a>\n  </p>\n</td></tr>\n</table></td></tr></table>\n</body></html>", "Newsletter", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_TemplateId",
                table: "Campaigns",
                column: "TemplateId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Campaigns");

            migrationBuilder.DropTable(
                name: "CampaignTemplates");
        }
    }
}

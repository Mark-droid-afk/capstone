using CRM.Application.DTOs;
using CRM.Application.Interfaces;
using CRM.Domain.Entities;

namespace CRM.Application.Services;

public class CampaignService(
    ICampaignRepository campaigns,
    ICustomerRepository customers,
    IEmailSender emailSender,
    IMarketingRepository marketing) : ICampaignService
{
    // ── Status mapping (string ↔ enum) ───────────────────────────────────────

    private static string ToStatusString(CampaignStatus s) => s switch
    {
        CampaignStatus.Draft      => "draft",
        CampaignStatus.Active     => "ended",
        CampaignStatus.Scheduled  => "scheduled",
        CampaignStatus.Recurring  => "recurring",
        CampaignStatus.Ended      => "ended",
        _                         => "ended"
    };

    private static string ToChannelString(CampaignChannel c) => c switch
    {
        CampaignChannel.Email => "email",
        CampaignChannel.InApp => "in_app",
        _                     => "email"
    };

    private static string ToScheduleTypeString(CampaignScheduleType s) => s switch
    {
        CampaignScheduleType.Now       => "now",
        CampaignScheduleType.Scheduled => "scheduled",
        CampaignScheduleType.Recurring => "recurring",
        _                              => "now"
    };

    private static CampaignChannel ParseChannel(string? c) => c?.ToLower() switch
    {
        "in_app" => CampaignChannel.InApp,
        _        => CampaignChannel.Email
    };

    private static CampaignScheduleType ParseScheduleType(string? s) => s?.ToLower() switch
    {
        "scheduled" => CampaignScheduleType.Scheduled,
        "recurring" => CampaignScheduleType.Recurring,
        _           => CampaignScheduleType.Now
    };

    // ── Response mapping ─────────────────────────────────────────────────────

    private static CampaignResponse ToResponse(Campaign c) => new(
        c.Id,
        c.Title,
        c.Subject,
        c.Description,
        ToChannelString(c.Channel),
        ToStatusString(c.Status),
        ToScheduleTypeString(c.ScheduleType),
        c.ScheduledAt,
        string.IsNullOrEmpty(c.RecurringDays) ? null : c.RecurringDays.Split(','),
        c.TemplateId,
        c.Template?.Name,
        c.ImageUrl,
        c.SentCount,
        c.AudienceFilter,
        c.CreatedAt,
        c.UpdatedAt,
        c.EndedAt
    );

    // ── Queries ───────────────────────────────────────────────────────────────

    public async Task<PaginatedResponse<CampaignResponse>> GetAllAsync(GetCampaignsRequest request)
    {
        // Business rule: the "active" tab shows all non-draft, non-ended campaigns
        CampaignStatus[]? statuses = request.Status?.ToLower() switch
        {
            "active"  => [CampaignStatus.Scheduled, CampaignStatus.Recurring],
            "draft"   => [CampaignStatus.Draft],
            "ended"   => [CampaignStatus.Ended, CampaignStatus.Active],
            _         => null
        };

        var (data, total) = await campaigns.GetAllAsync(statuses, request.Page, request.PageSize, request.Search);
        return new PaginatedResponse<CampaignResponse>(data.Select(ToResponse), total, request.Page, request.PageSize);
    }

    public async Task<CampaignResponse?> GetByIdAsync(Guid id)
    {
        var c = await campaigns.GetByIdAsync(id);
        return c is null ? null : ToResponse(c);
    }

    public async Task<IEnumerable<CampaignTemplateResponse>> GetTemplatesAsync()
    {
        var templates = await campaigns.GetTemplatesAsync();
        return templates.Select(t => new CampaignTemplateResponse(t.Id, t.Name, t.Description, t.PreviewUrl));
    }

    // ── Commands ──────────────────────────────────────────────────────────────

    public async Task<CampaignResponse> CreateAsync(CreateCampaignRequest request)
    {
        var scheduleType = ParseScheduleType(request.ScheduleType);

        var campaign = new Campaign
        {
            Title          = request.Title,
            Subject        = request.Subject,
            Description    = request.Description,
            Channel        = ParseChannel(request.Channel),
            ScheduleType   = scheduleType,
            ScheduledAt    = request.ScheduledAt is not null
                                ? DateTime.Parse(request.ScheduledAt).ToUniversalTime()
                                : null,
            RecurringDays  = request.RecurringDays is { Length: > 0 }
                                ? string.Join(",", request.RecurringDays)
                                : null,
            TemplateId     = request.TemplateId is not null ? Guid.Parse(request.TemplateId) : null,
            ImageUrl       = request.ImageUrl,
            AudienceFilter = request.AudienceFilter ?? "all",
            Status         = scheduleType switch
            {
                CampaignScheduleType.Scheduled => CampaignStatus.Scheduled,
                CampaignScheduleType.Recurring => CampaignStatus.Recurring,
                _                              => CampaignStatus.Ended
            },
            EndedAt        = scheduleType == CampaignScheduleType.Now ? DateTime.UtcNow : null
        };

        var created = await campaigns.CreateAsync(campaign);

        // Send immediately for "now" email campaigns
        if (scheduleType == CampaignScheduleType.Now && created.Channel == CampaignChannel.Email)
        {
            await SendEmailsForCampaignAsync(created);
            await campaigns.UpdateAsync(created);
        }

        return ToResponse(created);
    }

    public async Task<CampaignResponse> DraftAsync(DraftCampaignRequest request)
    {
        var campaign = new Campaign
        {
            Title          = request.Title,
            Subject        = request.Subject ?? string.Empty,
            Description    = request.Description ?? string.Empty,
            Channel        = ParseChannel(request.Channel),
            ScheduleType   = CampaignScheduleType.Now,
            Status         = CampaignStatus.Draft,
            AudienceFilter = request.AudienceFilter ?? "all"
        };

        var created = await campaigns.CreateAsync(campaign);
        return ToResponse(created);
    }

    // ── Scheduler hooks ───────────────────────────────────────────────────────

    public async Task ProcessScheduledCampaignsAsync()
    {
        var pending = await campaigns.GetPendingScheduledAsync();
        foreach (var c in pending)
        {
            c.Status    = CampaignStatus.Ended;
            c.EndedAt   = DateTime.UtcNow;
            c.UpdatedAt = DateTime.UtcNow;

            if (c.Channel == CampaignChannel.Email)
                await SendEmailsForCampaignAsync(c);

            await campaigns.UpdateAsync(c);
        }
    }

    public async Task ProcessRecurringCampaignsAsync()
    {
        var recurring = await campaigns.GetActiveRecurringAsync();
        var todayName = DateTime.UtcNow.DayOfWeek.ToString().ToLower();

        foreach (var c in recurring)
        {
            if (string.IsNullOrEmpty(c.RecurringDays)) continue;

            var days = c.RecurringDays.Split(',').Select(d => d.Trim().ToLower());
            if (!days.Contains(todayName)) continue;

            // Skip if already sent today
            if (c.LastSentAt.HasValue && c.LastSentAt.Value.Date == DateTime.UtcNow.Date) continue;

            if (c.Channel == CampaignChannel.Email)
                await SendEmailsForCampaignAsync(c);

            c.LastSentAt = DateTime.UtcNow;
            c.UpdatedAt  = DateTime.UtcNow;
            await campaigns.UpdateAsync(c);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private async Task SendEmailsForCampaignAsync(Campaign campaign)
    {
        var recipients = await customers.GetEmailRecipientsAsync(campaign.AudienceFilter);
        var recipientList = recipients.ToList();
        if (recipientList.Count == 0) return;

        string htmlBody = await BuildHtmlBodyAsync(campaign);
        int sent = 0;

        foreach (var customer in recipientList)
        {
            try
            {
                await emailSender.SendAsync(
                    customer.Email,
                    $"{customer.FirstName} {customer.LastName}",
                    campaign.Subject,
                    htmlBody);
                sent++;

                // Log this to marketing history
                var history = new MarketingHistory
                {
                    Id = Guid.NewGuid(),
                    CustomerId = customer.Id,
                    Title = campaign.Title,
                    Description = campaign.Description,
                    Channel = MarketingChannel.Email,
                    InteractionType = InteractionType.Sent,
                    SentAt = DateTime.UtcNow
                };
                await marketing.AddAsync(history);
            }
            catch
            {
                // Log and continue; don't fail the entire campaign on one bad address
            }
        }

        campaign.SentCount += sent;
        campaign.LastSentAt = DateTime.UtcNow;
        campaign.UpdatedAt  = DateTime.UtcNow;
    }

    private async Task<string> BuildHtmlBodyAsync(Campaign campaign)
    {
        string templateHtml = campaign.TemplateId.HasValue
            ? (await campaigns.GetTemplateByIdAsync(campaign.TemplateId.Value))?.HtmlBody ?? DefaultHtmlTemplate()
            : DefaultHtmlTemplate();

        var imageBlock = string.IsNullOrEmpty(campaign.ImageUrl)
            ? string.Empty
            : $"<img src=\"{campaign.ImageUrl}\" alt=\"Campaign Image\" style=\"width:100%;max-height:300px;object-fit:cover;display:block;\">";

        return templateHtml
            .Replace("{{title}}", System.Net.WebUtility.HtmlEncode(campaign.Title))
            .Replace("{{subject}}", System.Net.WebUtility.HtmlEncode(campaign.Subject))
            .Replace("{{description}}", campaign.Description) // allow rich text
            .Replace("{{imageBlock}}", imageBlock)
            .Replace("{{unsubscribeUrl}}", "#unsubscribe");
    }

    private static string DefaultHtmlTemplate() => """
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
        <title>{{subject}}</title></head>
        <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:40px 0;">
              <table width="600" cellpadding="0" cellspacing="0"
                style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
                <tr><td>{{imageBlock}}</td></tr>
                <tr><td style="padding:40px;">
                  <h1 style="margin:0 0 8px;font-size:28px;color:#1a1a1a;">{{title}}</h1>
                  <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.7;">{{description}}</p>
                </td></tr>
                <tr><td style="padding:20px 40px;background:#f8f8f8;border-top:1px solid #efefef;">
                  <p style="margin:0;font-size:12px;color:#999;text-align:center;">
                    <a href="{{unsubscribeUrl}}" style="color:#999;">Unsubscribe</a>
                  </p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """;
}

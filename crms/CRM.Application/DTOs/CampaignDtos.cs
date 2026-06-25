namespace CRM.Application.DTOs;

// ── Requests ─────────────────────────────────────────────────────────────────

public record GetCampaignsRequest(
    string? Status = null,
    int Page = 1,
    int PageSize = 10,
    string? Search = null
);

public record CreateCampaignRequest(
    string Title,
    string Subject,
    string Description,
    string Channel,
    string ScheduleType,
    string? ScheduledAt,
    string[]? RecurringDays,
    string? TemplateId,
    string? ImageUrl,
    string? AudienceFilter
);

public record DraftCampaignRequest(
    string Title,
    string? Subject,
    string? Description,
    string? Channel,
    string? AudienceFilter
);

// ── Responses ─────────────────────────────────────────────────────────────────

public record CampaignResponse(
    Guid Id,
    string Title,
    string Subject,
    string Description,
    string Channel,
    string Status,
    string ScheduleType,
    DateTime? ScheduledAt,
    string[]? RecurringDays,
    Guid? TemplateId,
    string? TemplateName,
    string? ImageUrl,
    int SentCount,
    string AudienceFilter,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? EndedAt
);

public record CampaignTemplateResponse(
    Guid Id,
    string Name,
    string Description,
    string? PreviewUrl
);

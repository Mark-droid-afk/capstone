namespace CRM.Domain.Entities;

public enum CampaignChannel { Email, InApp }
public enum CampaignStatus { Draft, Active, Scheduled, Recurring, Ended }
public enum CampaignScheduleType { Now, Scheduled, Recurring }

public class Campaign
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public CampaignChannel Channel { get; set; }
    public CampaignStatus Status { get; set; }
    public CampaignScheduleType ScheduleType { get; set; }
    public DateTime? ScheduledAt { get; set; }

    /// <summary>Comma-separated days, e.g. "monday,wednesday,friday"</summary>
    public string? RecurringDays { get; set; }

    public Guid? TemplateId { get; set; }

    /// <summary>Base64 data URI or public URL for the campaign banner image.</summary>
    public string? ImageUrl { get; set; }

    public int SentCount { get; set; }

    /// <summary>"all" | "Regular" | "InstitutionalBuyer"</summary>
    public string AudienceFilter { get; set; } = "all";

    /// <summary>Tracks last send date for recurring campaigns to prevent duplicate sends.</summary>
    public DateTime? LastSentAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }

    public CampaignTemplate? Template { get; set; }
}

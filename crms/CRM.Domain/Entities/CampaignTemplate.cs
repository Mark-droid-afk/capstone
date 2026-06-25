namespace CRM.Domain.Entities;

public class CampaignTemplate
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Raw HTML body. Supports placeholders:
    /// {{title}}, {{subject}}, {{description}}, {{imageBlock}}, {{unsubscribeUrl}}
    /// </summary>
    public string HtmlBody { get; set; } = string.Empty;

    /// <summary>Optional thumbnail URL shown in the template picker UI.</summary>
    public string? PreviewUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

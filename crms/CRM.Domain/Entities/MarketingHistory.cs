namespace CRM.Domain.Entities;

public enum MarketingChannel { Email, Sms, SocialMedia, PushNotification }
public enum InteractionType { Sent, Opened, Clicked, Converted }

public class MarketingHistory
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public MarketingChannel Channel { get; set; }
    public InteractionType InteractionType { get; set; }
    public DateTime SentAt { get; set; }

    public Customer Customer { get; set; } = null!;
}
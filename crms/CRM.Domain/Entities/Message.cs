namespace CRM.Domain.Entities;

public class Message
{
    public Guid     Id             { get; set; }
    public Guid     ConversationId { get; set; }

    /// <summary>FK to either Customer.Id or an agent user id.</summary>
    public Guid     SenderId       { get; set; }

    /// <summary>"customer" or "agent"</summary>
    public string   SenderRole     { get; set; } = "customer";

    /// <summary>Display name resolved at send time.</summary>
    public string   SenderName     { get; set; } = string.Empty;

    public string   Content        { get; set; } = string.Empty;

    /// <summary>Whether the agent has read this specific message.</summary>
    public bool     IsRead         { get; set; }

    public DateTime SentAt         { get; set; }

    public Conversation Conversation { get; set; } = null!;
}

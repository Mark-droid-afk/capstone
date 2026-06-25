namespace CRM.Domain.Entities;

public class Conversation
{
    public Guid     Id           { get; set; }
    public Guid     TicketId     { get; set; }
    public Guid     CustomerId   { get; set; }
    public Guid?    AgentId      { get; set; }

    /// <summary>Whether the agent has read the latest messages.</summary>
    public bool     IsRead       { get; set; }

    /// <summary>Number of messages not yet read by the agent.</summary>
    public int      UnreadCount  { get; set; }

    public DateTime CreatedAt    { get; set; }
    public DateTime UpdatedAt    { get; set; }

    public ICollection<Message> Messages { get; set; } = [];
}

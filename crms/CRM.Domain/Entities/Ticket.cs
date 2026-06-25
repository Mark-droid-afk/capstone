using CRM.Domain.Enums;

public class Ticket
{
    public Guid      Id              { get; set; }
    public string    Title           { get; set; } = string.Empty;
    public string    Description     { get; set; } = string.Empty;
    public string    Type            { get; set; } = "Concern";   // Concern | Inquiry | Request
    public TicketStatus Status       { get; set; }                 // Available, Claimed, Resolved, Cancelled
    public string?   ImageUrl        { get; set; }
    public Guid?     AssignedAgentId { get; set; }
    public Guid      CustomerId      { get; set; }
    public Guid?     ConversationId  { get; set; }
    public DateTime  CreatedAt       { get; set; }
    public DateTime? UpdatedAt       { get; set; }
}
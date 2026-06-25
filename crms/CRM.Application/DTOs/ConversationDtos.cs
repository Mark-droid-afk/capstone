namespace CRM.Application.DTOs.Conversations;

// ── Outbound DTOs ─────────────────────────────────────────────────────────────

public class MessageDto
{
    public Guid     Id             { get; set; }
    public Guid     ConversationId { get; set; }
    public string   Content        { get; set; } = string.Empty;
    public Guid     SenderId       { get; set; }
    public string   SenderName     { get; set; } = string.Empty;
    public string   SenderRole     { get; set; } = "customer";  // "customer" | "agent"
    public bool     IsRead         { get; set; }
    public DateTime SentAt         { get; set; }
}

public class ConversationDto
{
    public Guid         Id           { get; set; }
    public Guid         TicketId     { get; set; }
    public string       TicketTitle  { get; set; } = string.Empty;
    public string       TicketType   { get; set; } = string.Empty;  // concern | inquiry | request
    public string       TicketStatus { get; set; } = string.Empty;  // available | claimed | resolved
    public CustomerInfo Customer     { get; set; } = null!;
    public AgentInfo?   Agent        { get; set; }
    public MessageDto?  LastMessage  { get; set; }
    public int          UnreadCount  { get; set; }
    public bool         IsRead       { get; set; }
    public DateTime     CreatedAt    { get; set; }
    public DateTime     UpdatedAt    { get; set; }

    public class CustomerInfo
    {
        public Guid    Id           { get; set; }
        public string  FirstName    { get; set; } = string.Empty;
        public string  LastName     { get; set; } = string.Empty;
        public string  Email        { get; set; } = string.Empty;
        public string? Phone        { get; set; }
        public string? ProfileImage { get; set; }
    }

    public class AgentInfo
    {
        public Guid   Id        { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName  { get; set; } = string.Empty;
        public string Email     { get; set; } = string.Empty;
    }
}

/// <summary>Full conversation detail including message history — used by GET /conversations/{id}.</summary>
public class ConversationDetailDto : ConversationDto
{
    public List<MessageDto> Messages { get; set; } = [];
}

/// <summary>Customer-facing view — returned by GET /customer/tickets/{id}/conversation.</summary>
public class CustomerConversationDetailDto
{
    public Guid          Id           { get; set; }
    public Guid          TicketId     { get; set; }
    public string        TicketTitle  { get; set; } = string.Empty;
    public string        TicketType   { get; set; } = string.Empty;
    public string        TicketStatus { get; set; } = string.Empty;
    public AssignedAgent AssignedTo   { get; set; } = new();
    public List<MessageDto> Messages  { get; set; } = [];
    public DateTime      CreatedAt    { get; set; }
    public DateTime      UpdatedAt    { get; set; }

    public class AssignedAgent
    {
        public string? EmployeeFirstName { get; set; }
        public string? EmployeeLastName  { get; set; }
    }
}

// ── Paginated wrappers ────────────────────────────────────────────────────────

public class PaginatedConversationsResponse
{
    public IEnumerable<ConversationDto> Data      { get; set; } = [];
    public int                          Total     { get; set; }
    public int                          Page      { get; set; }
    public int                          PageSize  { get; set; }
}

public class PaginatedMessagesResponse
{
    public IEnumerable<MessageDto> Data     { get; set; } = [];
    public int                     Total    { get; set; }
    public int                     Page     { get; set; }
    public int                     PageSize { get; set; }
}

// ── Inbound requests ─────────────────────────────────────────────────────────

public class SendMessageRequest
{
    public string Content { get; set; } = string.Empty;
}

public class ConversationListRequest
{
    public int   Page     { get; set; } = 1;
    public int   PageSize { get; set; } = 20;
    public bool? IsRead   { get; set; }   // null = all, true = read, false = unread
}

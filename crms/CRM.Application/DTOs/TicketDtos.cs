
namespace CRM.Application.DTOs.Tickets;

public class TicketCustomerDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? ProfileImage { get; set; }
}

public class TicketAgentDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class TicketDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Category { get; set; } = "other";
    public string Priority { get; set; } = "medium";
    public string? ImageUrl { get; set; }
    public Guid CustomerId { get; set; }
    public TicketCustomerDto Customer { get; set; } = null!;
    public TicketAgentDto? Agent { get; set; }
    public Guid? AssignedAgentId { get; set; }
    public Guid? ConversationId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class GetTicketsRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
}

public class PaginatedTicketsResponse
{
    public IEnumerable<TicketDto> Data { get; set; } = [];
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int Total => TotalCount;                               // camelCase alias for frontend
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}
 

// ── Customer-facing DTOs ─────────────────────────────────────────────────────

public class CustomerTicketDto
{
    public Guid      Id             { get; set; }
    public string    Title          { get; set; } = string.Empty;
    public string    Description    { get; set; } = string.Empty;
    public string    Type           { get; set; } = string.Empty; // Concern | Inquiry | Request
    public string    Status         { get; set; } = string.Empty; // Pending | Ongoing | Completed | Cancelled
    public string?   ImageUrl       { get; set; }
    public string?   ClaimedByName  { get; set; }                 // reserved for future agent-name lookup
    public Guid?     ConversationId { get; set; }
    public DateTime  CreatedAt      { get; set; }
    public DateTime? UpdatedAt      { get; set; }
}

public class CreateCustomerTicketRequest
{
    public string Title       { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type        { get; set; } = "Concern"; // Concern | Inquiry | Request
}

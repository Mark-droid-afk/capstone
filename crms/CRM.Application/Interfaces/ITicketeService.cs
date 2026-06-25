using CRM.Application.DTOs.Tickets;

namespace CRM.Application.Interfaces;

public interface ITicketService
{
    Task<PaginatedTicketsResponse> GetAvailableAsync(GetTicketsRequest request);

    Task<PaginatedTicketsResponse> GetClaimedAsync(Guid agentId, GetTicketsRequest request);

    Task<PaginatedTicketsResponse> GetResolvedAsync(Guid agentId, GetTicketsRequest request);

    Task<TicketDto?> GetByIdAsync(Guid id);

    Task<TicketDto?> ClaimAsync(Guid ticketId, Guid agentId);

    Task<TicketDto?> UnclaimAsync(Guid ticketId, Guid agentId);

    Task<TicketDto?> ResolveAsync(Guid ticketId, Guid agentId);
}
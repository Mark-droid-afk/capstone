using CRM.Application.DTOs.Tickets;
using CRM.Application.Interfaces;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using CRM.Infrastructure.Data;
using CRM.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Services;

public class TicketService(
    AppDbContext db,
    IConversationService conversationService,
    IHubContext<ConversationHub> hub) : ITicketService
{
    public async Task<PaginatedTicketsResponse> GetAvailableAsync(GetTicketsRequest request)
    {
        var query = db.Tickets
            .AsNoTracking()
            .Where(t => t.Status == TicketStatus.Available);

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(t =>
                t.Title.ToLower().Contains(request.Search.ToLower()) ||
                t.Description.ToLower().Contains(request.Search.ToLower()));

        return await ToPaginatedResponseAsync(query, request.Page, request.PageSize);
    }

    public async Task<PaginatedTicketsResponse> GetClaimedAsync(Guid agentId, GetTicketsRequest request)
    {
        var query = db.Tickets
            .AsNoTracking()
            .Where(t => t.Status == TicketStatus.Claimed && t.AssignedAgentId == agentId);

        return await ToPaginatedResponseAsync(query, request.Page, request.PageSize);
    }

    public async Task<PaginatedTicketsResponse> GetResolvedAsync(Guid agentId, GetTicketsRequest request)
    {
        var query = db.Tickets
            .AsNoTracking()
            .Where(t => t.Status == TicketStatus.Resolved && t.AssignedAgentId == agentId);

        return await ToPaginatedResponseAsync(query, request.Page, request.PageSize);
    }

    public async Task<TicketDto?> GetByIdAsync(Guid id)
    {
        var ticket = await db.Tickets
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket is null) return null;

        var customerIdStr = ticket.CustomerId.ToString();
        var customer = await db.Customers
            .IgnoreQueryFilters()
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.AuthId == customerIdStr);

        return MapToDto(ticket, customer);
    }

    public async Task<TicketDto?> ClaimAsync(Guid ticketId, Guid agentId)
    {
        var ticket = await db.Tickets.FindAsync(ticketId);

        if (ticket is null)
            return null;

        if (ticket.Status != TicketStatus.Available)
            throw new InvalidOperationException(
                $"Ticket '{ticketId}' cannot be claimed because its status is '{ticket.Status}'.");

        ticket.Status = TicketStatus.Claimed;
        ticket.AssignedAgentId = agentId;
        ticket.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        // Auto-create a Conversation for this ticket
        var conversationId = await conversationService.CreateForTicketAsync(
            ticketId, ticket.CustomerId, agentId);

        ticket.ConversationId = conversationId;
        await db.SaveChangesAsync();

        // Notify the customer that the ticket is now ongoing
        await hub.Clients
            .Group(conversationId.ToString())
            .SendAsync("TicketResolved", new
            {
                ticketId     = ticketId.ToString(),
                ticketStatus = "ongoing"
            });

        var customerIdStr = ticket.CustomerId.ToString();
        var customer = await db.Customers.IgnoreQueryFilters().AsNoTracking().FirstOrDefaultAsync(c => c.AuthId == customerIdStr);
        return MapToDto(ticket, customer);
    }

    public async Task<TicketDto?> UnclaimAsync(Guid ticketId, Guid agentId)
    {
        var ticket = await db.Tickets.FindAsync(ticketId);

        if (ticket is null)
            return null;

        if (ticket.Status != TicketStatus.Claimed || ticket.AssignedAgentId != agentId)
            throw new InvalidOperationException(
                $"Ticket '{ticketId}' cannot be unclaimed. It must be claimed by the requesting agent.");

        ticket.Status = TicketStatus.Available;
        ticket.AssignedAgentId = null;
        ticket.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        var customerIdStr = ticket.CustomerId.ToString();
        var customer = await db.Customers.IgnoreQueryFilters().AsNoTracking().FirstOrDefaultAsync(c => c.AuthId == customerIdStr);
        return MapToDto(ticket, customer);
    }

    public async Task<TicketDto?> ResolveAsync(Guid ticketId, Guid agentId)
    {
        var ticket = await db.Tickets.FindAsync(ticketId);

        if (ticket is null)
            return null;

        if (ticket.Status != TicketStatus.Claimed || ticket.AssignedAgentId != agentId)
            throw new InvalidOperationException(
                $"Ticket '{ticketId}' cannot be resolved. It must be claimed by the requesting agent.");

        ticket.Status = TicketStatus.Resolved;
        ticket.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        // Broadcast ticket resolved so customer chat input gets disabled
        if (ticket.ConversationId.HasValue)
        {
            await hub.Clients
                .Group(ticket.ConversationId.Value.ToString())
                .SendAsync("TicketResolved", new
                {
                    ticketId     = ticketId.ToString(),
                    ticketStatus = "resolved"
                });
        }

        var customerIdStr = ticket.CustomerId.ToString();
        var customer = await db.Customers.IgnoreQueryFilters().AsNoTracking().FirstOrDefaultAsync(c => c.AuthId == customerIdStr);
        return MapToDto(ticket, customer);
    }

    private async Task<PaginatedTicketsResponse> ToPaginatedResponseAsync(
        IQueryable<Ticket> query, int page, int pageSize)
    {
        var totalCount = await query.CountAsync();

        var ticketList = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var customerIds = ticketList.Select(t => t.CustomerId).Distinct().ToList();
        var customers = await db.Customers
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(c => customerIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id);

        var items = ticketList.Select(t =>
        {
            customers.TryGetValue(t.CustomerId, out var c);
            return MapToDto(t, c);
        }).ToList();

        return new PaginatedTicketsResponse
        {
            Data = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    private static TicketDto MapToDto(Ticket t, Customer? c) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        Status = t.Status.ToString().ToLower(),   // "available" | "claimed" | "resolved"
        Category = t.Type.ToLower(),
        Priority = "medium",
        ImageUrl = t.ImageUrl,
        CustomerId = t.CustomerId,
        Customer = c is null ? new TicketCustomerDto
        {
            Id = t.CustomerId,
            FirstName = "Unknown",
            LastName = "Customer",
            Email = "unknown@customer.com"
        } : new TicketCustomerDto
        {
            Id = c.Id,
            FirstName = c.FirstName,
            LastName = c.LastName,
            Email = c.Email,
            Phone = c.Phone,
            ProfileImage = c.ProfileImage
        },
        AssignedAgentId = t.AssignedAgentId,
        ConversationId = t.ConversationId,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt
    };
}

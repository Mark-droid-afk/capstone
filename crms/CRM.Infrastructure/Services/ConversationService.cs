using CRM.Application.DTOs.Conversations;
using CRM.Application.Interfaces;
using CRM.Domain.Entities;
using CRM.Infrastructure.Data;
using CRM.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Services;

public class ConversationService(
    AppDbContext db,
    IHubContext<ConversationHub> hub) : IConversationService
{
    // ─────────────────────────────────────────────────────────────────────────
    // Agent-facing
    // ─────────────────────────────────────────────────────────────────────────

    public async Task<PaginatedConversationsResponse> GetAllAsync(
        Guid agentId, ConversationListRequest request)
    {
        var query = db.Conversations
            .AsNoTracking()
            .Where(c => c.AgentId == agentId);

        if (request.IsRead.HasValue)
            query = query.Where(c => c.IsRead == request.IsRead.Value);

        var totalCount = await query.CountAsync();

        var convList = await query
            .OrderByDescending(c => c.UpdatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var customerIdStrs = convList.Select(c => c.CustomerId.ToString()).Distinct().ToList();
        var customerList = await db.Customers
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(c => c.AuthId != null && customerIdStrs.Contains(c.AuthId))
            .ToListAsync();
        var customers = customerList.ToDictionary(c => Guid.Parse(c.AuthId!));

        var ticketIds = convList.Select(c => c.TicketId).Distinct().ToList();
        var tickets   = await db.Tickets
            .AsNoTracking()
            .Where(t => ticketIds.Contains(t.Id))
            .ToDictionaryAsync(t => t.Id);

        var convIds   = convList.Select(c => c.Id).ToList();
        var lastMsgs  = await db.Messages
            .AsNoTracking()
            .Where(m => convIds.Contains(m.ConversationId))
            .GroupBy(m => m.ConversationId)
            .Select(g => g.OrderByDescending(m => m.SentAt).First())
            .ToListAsync();
        var lastMsgMap = lastMsgs.ToDictionary(m => m.ConversationId);

        var items = convList.Select(c =>
        {
            customers.TryGetValue(c.CustomerId, out var cust);
            tickets.TryGetValue(c.TicketId, out var ticket);
            lastMsgMap.TryGetValue(c.Id, out var lastMsg);
            return MapToDto(c, cust, ticket, lastMsg);
        }).ToList();

        return new PaginatedConversationsResponse
        {
            Data     = items,
            Total    = totalCount,
            Page     = request.Page,
            PageSize = request.PageSize
        };
    }

    public async Task<ConversationDetailDto?> GetByIdAsync(Guid conversationId, Guid agentId)
    {
        var conversation = await db.Conversations
            .AsNoTracking()
            .Include(c => c.Messages.OrderBy(m => m.SentAt))
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.AgentId == agentId);

        if (conversation is null) return null;

        var customerIdStr = conversation.CustomerId.ToString();
        var customer = await db.Customers.IgnoreQueryFilters().AsNoTracking()
            .FirstOrDefaultAsync(c => c.AuthId == customerIdStr);
        var ticket   = await db.Tickets.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == conversation.TicketId);

        var dto = MapToDetailDto(conversation, customer, ticket);
        return dto;
    }

    public async Task<PaginatedMessagesResponse> GetMessagesAsync(
        Guid conversationId, Guid agentId, int page, int pageSize)
    {
        // Verify agent owns this conversation
        var exists = await db.Conversations.AnyAsync(
            c => c.Id == conversationId && c.AgentId == agentId);
        if (!exists) return new PaginatedMessagesResponse();

        var query = db.Messages
            .AsNoTracking()
            .Where(m => m.ConversationId == conversationId);

        var total = await query.CountAsync();

        // Return oldest→newest for the chat view
        var msgs = await query
            .OrderBy(m => m.SentAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedMessagesResponse
        {
            Data     = msgs.Select(MapMessage),
            Total    = total,
            Page     = page,
            PageSize = pageSize
        };
    }

    public async Task<MessageDto> SendAgentMessageAsync(
        Guid conversationId, Guid agentId, string agentName, string content)
    {
        var conversation = await db.Conversations
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.AgentId == agentId)
            ?? throw new InvalidOperationException("Conversation not found.");

        var msg = new Message
        {
            Id             = Guid.NewGuid(),
            ConversationId = conversationId,
            SenderId       = agentId,
            SenderRole     = "agent",
            SenderName     = agentName,
            Content        = content,
            IsRead         = false,
            SentAt         = DateTime.UtcNow
        };

        db.Messages.Add(msg);
        conversation.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var dto = MapMessage(msg);

        // Broadcast to all members of the conversation group (includes customer)
        await hub.Clients.Group(conversationId.ToString()).SendAsync("ReceiveMessage", dto);

        return dto;
    }

    public async Task MarkReadAsync(Guid conversationId, Guid agentId)
    {
        var conversation = await db.Conversations
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.AgentId == agentId);

        if (conversation is null) return;

        conversation.IsRead      = true;
        conversation.UnreadCount = 0;

        // Mark individual messages as read
        await db.Messages
            .Where(m => m.ConversationId == conversationId && !m.IsRead && m.SenderRole == "customer")
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.IsRead, true));

        await db.SaveChangesAsync();
    }

    public async Task MarkUnreadAsync(Guid conversationId, Guid agentId)
    {
        var conversation = await db.Conversations
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.AgentId == agentId);

        if (conversation is null) return;

        conversation.IsRead = false;
        await db.SaveChangesAsync();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Customer-facing
    // ─────────────────────────────────────────────────────────────────────────

    public async Task<CustomerConversationDetailDto?> GetByTicketAsync(Guid ticketId, Guid customerId)
    {
        var ticket = await db.Tickets.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == ticketId && t.CustomerId == customerId);

        // Ticket not found or doesn't belong to this customer
        if (ticket is null) return null;

        var ticketTypeLabel = ticket.Type?.ToLower() ?? "concern";
        var ticketStatusLabel = ticket.Status switch
        {
            CRM.Domain.Enums.TicketStatus.Available  => "pending",
            CRM.Domain.Enums.TicketStatus.Claimed    => "ongoing",
            CRM.Domain.Enums.TicketStatus.Resolved   => "resolved",
            CRM.Domain.Enums.TicketStatus.Cancelled  => "cancelled",
            _                                         => ticket.Status.ToString().ToLower()
        };

        // ── No conversation yet (ticket is still pending / not claimed) ───────
        // Return a synthetic response so the customer UI can render the
        // correct pending-state banner instead of crashing with a 404.
        if (ticket.ConversationId is null)
        {
            return new CustomerConversationDetailDto
            {
                Id           = Guid.Empty,           // no real conversation yet
                TicketId     = ticket.Id,
                TicketTitle  = ticket.Title,
                TicketType   = ticketTypeLabel,
                TicketStatus = ticketStatusLabel,    // "pending"
                AssignedTo   = new CustomerConversationDetailDto.AssignedAgent(),
                Messages     = [],
                CreatedAt    = ticket.CreatedAt,
                UpdatedAt    = ticket.UpdatedAt ?? ticket.CreatedAt
            };
        }

        // ── Conversation exists ───────────────────────────────────────────────
        var conversation = await db.Conversations
            .AsNoTracking()
            .Include(c => c.Messages.OrderBy(m => m.SentAt))
            .FirstOrDefaultAsync(c => c.Id == ticket.ConversationId.Value);

        if (conversation is null) return null;

        // Resolve agent name (agents live in the Customers table, synced from auth)
        string? agentFirst = null, agentLast = null;
        if (conversation.AgentId.HasValue)
        {
            var agent = await db.Customers.IgnoreQueryFilters().AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == conversation.AgentId.Value);
            agentFirst = agent?.FirstName;
            agentLast  = agent?.LastName;
        }

        return new CustomerConversationDetailDto
        {
            Id           = conversation.Id,
            TicketId     = ticket.Id,
            TicketTitle  = ticket.Title,
            TicketType   = ticketTypeLabel,
            TicketStatus = ticketStatusLabel,
            AssignedTo   = new CustomerConversationDetailDto.AssignedAgent
            {
                EmployeeFirstName = agentFirst,
                EmployeeLastName  = agentLast
            },
            Messages     = conversation.Messages.Select(MapMessage).ToList(),
            CreatedAt    = conversation.CreatedAt,
            UpdatedAt    = conversation.UpdatedAt
        };
    }

    public async Task<MessageDto> SendCustomerMessageAsync(
        Guid ticketId, Guid customerId, string customerName, string content)
    {
        var ticket = await db.Tickets.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == ticketId && t.CustomerId == customerId)
            ?? throw new InvalidOperationException("Ticket not found.");

        if (ticket.ConversationId is null)
            throw new InvalidOperationException("No active conversation for this ticket.");

        var conversationId = ticket.ConversationId.Value;

        var conversation = await db.Conversations
            .FirstOrDefaultAsync(c => c.Id == conversationId)
            ?? throw new InvalidOperationException("Conversation not found.");

        var msg = new Message
        {
            Id             = Guid.NewGuid(),
            ConversationId = conversationId,
            SenderId       = customerId,
            SenderRole     = "customer",
            SenderName     = customerName,
            Content        = content,
            IsRead         = false,
            SentAt         = DateTime.UtcNow
        };

        db.Messages.Add(msg);
        conversation.UnreadCount++;
        conversation.IsRead    = false;
        conversation.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var dto = MapMessage(msg);

        // Broadcast to all members of the conversation group (includes agent)
        await hub.Clients.Group(conversationId.ToString()).SendAsync("ReceiveMessage", dto);

        return dto;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Internal
    // ─────────────────────────────────────────────────────────────────────────

    public async Task<Guid> CreateForTicketAsync(Guid ticketId, Guid customerId, Guid agentId)
    {
        var conversation = new Conversation
        {
            Id         = Guid.NewGuid(),
            TicketId   = ticketId,
            CustomerId = customerId,
            AgentId    = agentId,
            IsRead     = true,
            UnreadCount = 0,
            CreatedAt  = DateTime.UtcNow,
            UpdatedAt  = DateTime.UtcNow
        };

        db.Conversations.Add(conversation);
        await db.SaveChangesAsync();
        return conversation.Id;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Mappers
    // ─────────────────────────────────────────────────────────────────────────

    private static MessageDto MapMessage(Message m) => new()
    {
        Id             = m.Id,
        ConversationId = m.ConversationId,
        Content        = m.Content,
        SenderId       = m.SenderId,
        SenderName     = m.SenderName,
        SenderRole     = m.SenderRole,
        IsRead         = m.IsRead,
        SentAt         = m.SentAt
    };

    private static ConversationDto MapToDto(
        Conversation c,
        CRM.Domain.Entities.Customer? cust,
        Ticket? ticket,
        Message? lastMsg) => new()
    {
        Id           = c.Id,
        TicketId     = c.TicketId,
        TicketTitle  = ticket?.Title ?? string.Empty,
        TicketType   = ticket?.Type?.ToLower() ?? "concern",
        TicketStatus = ticket?.Status.ToString().ToLower() ?? "available",
        Customer     = cust is null
            ? new ConversationDto.CustomerInfo { Id = c.CustomerId }
            : new ConversationDto.CustomerInfo
            {
                Id           = cust.Id,
                FirstName    = cust.FirstName,
                LastName     = cust.LastName,
                Email        = cust.Email,
                Phone        = cust.Phone,
                ProfileImage = cust.ProfileImage
            },
        LastMessage  = lastMsg is null ? null : MapMessage(lastMsg),
        UnreadCount  = c.UnreadCount,
        IsRead       = c.IsRead,
        CreatedAt    = c.CreatedAt,
        UpdatedAt    = c.UpdatedAt
    };

    private static ConversationDetailDto MapToDetailDto(
        Conversation c,
        CRM.Domain.Entities.Customer? cust,
        Ticket? ticket) => new()
    {
        Id           = c.Id,
        TicketId     = c.TicketId,
        TicketTitle  = ticket?.Title ?? string.Empty,
        TicketType   = ticket?.Type?.ToLower() ?? "concern",
        TicketStatus = ticket?.Status.ToString().ToLower() ?? "available",
        Customer     = cust is null
            ? new ConversationDto.CustomerInfo { Id = c.CustomerId }
            : new ConversationDto.CustomerInfo
            {
                Id           = cust.Id,
                FirstName    = cust.FirstName,
                LastName     = cust.LastName,
                Email        = cust.Email,
                Phone        = cust.Phone,
                ProfileImage = cust.ProfileImage
            },
        UnreadCount  = c.UnreadCount,
        IsRead       = c.IsRead,
        CreatedAt    = c.CreatedAt,
        UpdatedAt    = c.UpdatedAt,
        Messages     = c.Messages.Select(MapMessage).ToList()
    };
}

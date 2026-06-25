using CRM.Application.Interfaces;
using CRM.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Hubs;

/// <summary>
/// Unified SignalR hub for real-time conversation messaging.
///
/// Agent methods  : JoinConversation / LeaveConversation / SendMessage
/// Customer methods: JoinTicket / LeaveTicket
///
/// Both sides ultimately join the same group keyed by conversationId,
/// so ReceiveMessage is broadcast to everyone in the conversation.
/// </summary>
[Authorize]
public class ConversationHub(IConversationService conversationService, AppDbContext db) : Hub
{
    // ─── Agent ───────────────────────────────────────────────────────────────

    /// <summary>Agent joins a conversation group by conversationId.</summary>
    public async Task JoinConversation(string conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
    }

    /// <summary>Agent leaves a conversation group.</summary>
    public async Task LeaveConversation(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
    }

    /// <summary>
    /// Agent sends a message via SignalR.
    /// Persists to DB and broadcasts ReceiveMessage to the whole group.
    /// </summary>
    public async Task SendMessage(string conversationId, string content)
    {
        if (string.IsNullOrWhiteSpace(content)) return;

        var agentId = GetUserId();
        if (agentId is null) return;

        // Resolve agent name
        var agentName = await ResolveAgentName(agentId.Value);

        await conversationService.SendAgentMessageAsync(
            Guid.Parse(conversationId), agentId.Value, agentName, content);

        // Broadcast already happens inside the service via IHubContext
    }

    // ─── Customer ────────────────────────────────────────────────────────────

    /// <summary>
    /// Customer joins the conversation group that belongs to the given ticket.
    /// Resolves ticketId → conversationId internally.
    /// </summary>
    public async Task JoinTicket(string ticketId)
    {
        if (!Guid.TryParse(ticketId, out var ticketGuid)) return;

        var ticket = await db.Tickets
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == ticketGuid);

        if (ticket?.ConversationId is null) return;

        var groupName = ticket.ConversationId.Value.ToString();
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    /// <summary>Customer leaves the conversation group.</summary>
    public async Task LeaveTicket(string ticketId)
    {
        if (!Guid.TryParse(ticketId, out var ticketGuid)) return;

        var ticket = await db.Tickets
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == ticketGuid);

        if (ticket?.ConversationId is null) return;

        var groupName = ticket.ConversationId.Value.ToString();
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Guid? GetUserId()
    {
        var raw = Context.User?.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(raw, out var id) ? id : null;
    }

    private async Task<string> ResolveAgentName(Guid agentId)
    {
        // Agents currently live in the Customer table (synced from auth service).
        // Fall back to "Support Agent" if not found.
        var agent = await db.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == agentId);

        return agent is null ? "Support Agent" : $"{agent.FirstName} {agent.LastName}";
    }
}

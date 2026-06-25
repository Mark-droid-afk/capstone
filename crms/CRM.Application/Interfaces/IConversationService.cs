using CRM.Application.DTOs.Conversations;

namespace CRM.Application.Interfaces;

public interface IConversationService
{
    // ── Agent-facing ──────────────────────────────────────────────────────────

    /// <summary>Paginated list of conversations for the signed-in agent (All / Read / Unread tabs).</summary>
    Task<PaginatedConversationsResponse> GetAllAsync(Guid agentId, ConversationListRequest request);

    /// <summary>Full conversation detail including all messages.</summary>
    Task<ConversationDetailDto?> GetByIdAsync(Guid conversationId, Guid agentId);

    /// <summary>Paginated messages for a conversation (ordered oldest→newest).</summary>
    Task<PaginatedMessagesResponse> GetMessagesAsync(Guid conversationId, Guid agentId, int page, int pageSize);

    /// <summary>Agent sends a message. Broadcasts ReceiveMessage via SignalR to the group.</summary>
    Task<MessageDto> SendAgentMessageAsync(Guid conversationId, Guid agentId, string agentName, string content);

    /// <summary>Mark a conversation as read (resets unread count).</summary>
    Task MarkReadAsync(Guid conversationId, Guid agentId);

    /// <summary>Mark a conversation as unread.</summary>
    Task MarkUnreadAsync(Guid conversationId, Guid agentId);

    // ── Customer-facing ───────────────────────────────────────────────────────

    /// <summary>Returns the full conversation for a given ticket + customer.</summary>
    Task<CustomerConversationDetailDto?> GetByTicketAsync(Guid ticketId, Guid customerId);

    /// <summary>Customer sends a message. Broadcasts ReceiveMessage via SignalR to the group.</summary>
    Task<MessageDto> SendCustomerMessageAsync(Guid ticketId, Guid customerId, string customerName, string content);

    // ── Internal ─────────────────────────────────────────────────────────────

    /// <summary>
    /// Creates a new Conversation row when a ticket is claimed.
    /// Returns the new conversation's ID.
    /// </summary>
    Task<Guid> CreateForTicketAsync(Guid ticketId, Guid customerId, Guid agentId);
}

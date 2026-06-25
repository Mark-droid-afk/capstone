using System.Security.Claims;
using CRM.Application.DTOs.Conversations;
using CRM.Application.Interfaces;
using CRM.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/conversations")]
public class ConversationsController(
    IConversationService conversationService,
    AppDbContext db) : ControllerBase
{
    // GET /api/v1/conversations?page=1&pageSize=20&isRead=false
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ConversationListRequest request)
    {
        var agentId = GetAgentId();
        if (agentId is null) return Unauthorized();

        var result = await conversationService.GetAllAsync(agentId.Value, request);
        return Ok(result);
    }

    // GET /api/v1/conversations/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var agentId = GetAgentId();
        if (agentId is null) return Unauthorized();

        var result = await conversationService.GetByIdAsync(id, agentId.Value);
        return result is null ? NotFound() : Ok(result);
    }

    // GET /api/v1/conversations/{id}/messages?page=1&pageSize=50
    [HttpGet("{id:guid}/messages")]
    public async Task<IActionResult> GetMessages(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var agentId = GetAgentId();
        if (agentId is null) return Unauthorized();

        var result = await conversationService.GetMessagesAsync(id, agentId.Value, page, pageSize);
        return Ok(result);
    }

    // POST /api/v1/conversations/{id}/messages
    [HttpPost("{id:guid}/messages")]
    public async Task<IActionResult> SendMessage(
        Guid id,
        [FromBody] SendMessageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
            return BadRequest(new { message = "Content cannot be empty." });

        var agentId = GetAgentId();
        if (agentId is null) return Unauthorized();

        var agentName = await ResolveAgentName(agentId.Value);

        try
        {
            var msg = await conversationService.SendAgentMessageAsync(
                id, agentId.Value, agentName, request.Content);
            return Ok(msg);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PATCH /api/v1/conversations/{id}/read
    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var agentId = GetAgentId();
        if (agentId is null) return Unauthorized();

        await conversationService.MarkReadAsync(id, agentId.Value);
        return NoContent();
    }

    // PATCH /api/v1/conversations/{id}/unread
    [HttpPatch("{id:guid}/unread")]
    public async Task<IActionResult> MarkUnread(Guid id)
    {
        var agentId = GetAgentId();
        if (agentId is null) return Unauthorized();

        await conversationService.MarkUnreadAsync(id, agentId.Value);
        return NoContent();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Guid? GetAgentId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(raw, out var id) ? id : null;
    }

    private async Task<string> ResolveAgentName(Guid agentId)
    {
        var agentIdStr = agentId.ToString();
        var agent = await db.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.AuthId == agentIdStr);
        return agent is null ? "Support Agent" : $"{agent.FirstName} {agent.LastName}";
    }
}

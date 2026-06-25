using System.Security.Claims;
using CRM.Application.DTOs.Conversations;
using CRM.Application.DTOs.Tickets;
using CRM.Application.Interfaces;
using CRM.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers;

[ApiController]
[Authorize]                             // validates the customer JWT; AgentId is NOT needed here
[Route("api/v1/customer/tickets")]
public class CustomerTicketsController(
    ICustomerTicketService customerTicketService,
    IConversationService conversationService,
    AppDbContext db) : ControllerBase
{
    /// <summary>List tickets for the authenticated customer filtered by status.</summary>
    /// <param name="status">Pending | Ongoing | Completed | Cancelled</param>
    [HttpGet]
    public async Task<IActionResult> GetByStatus([FromQuery] string status = "Pending")
    {
        var customerId = GetCustomerId();
        if (customerId is null) return Unauthorized();

        var result = await customerTicketService.GetByStatusAsync(customerId.Value, status);
        return Ok(result);
    }

    /// <summary>Get a single ticket's detail (must belong to the authenticated customer).</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var customerId = GetCustomerId();
        if (customerId is null) return Unauthorized();

        var result = await customerTicketService.GetByIdAsync(id, customerId.Value);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>Create a new ticket. Accepts multipart/form-data when an image is attached.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateCustomerTicketRequest request,
                                            IFormFile? image = null)
    {
        var customerId = GetCustomerId();
        if (customerId is null) return Unauthorized();

        Stream?  imageStream   = image is { Length: > 0 } ? image.OpenReadStream() : null;
        string? imageFileName  = image?.FileName;

        var created = await customerTicketService.CreateAsync(
            customerId.Value, request, imageStream, imageFileName);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Cancel a pending ticket.</summary>
    [HttpPatch("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var customerId = GetCustomerId();
        if (customerId is null) return Unauthorized();

        try
        {
            var result = await customerTicketService.CancelAsync(id, customerId.Value);
            return result is null ? NotFound() : Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Get the full conversation for a ticket (customer view).</summary>
    [HttpGet("{id:guid}/conversation")]
    public async Task<IActionResult> GetConversation(Guid id)
    {
        var customerId = GetCustomerId();
        if (customerId is null) return Unauthorized();

        var result = await conversationService.GetByTicketAsync(id, customerId.Value);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>Customer sends a message in a ticket conversation.</summary>
    [HttpPost("{id:guid}/conversation/messages")]
    public async Task<IActionResult> SendMessage(
        Guid id,
        [FromBody] SendMessageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
            return BadRequest(new { message = "Content cannot be empty." });

        var customerId = GetCustomerId();
        if (customerId is null) return Unauthorized();

        var customerName = await ResolveCustomerName(customerId.Value);

        try
        {
            var msg = await conversationService.SendCustomerMessageAsync(
                id, customerId.Value, customerName, request.Content);
            return Ok(msg);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Extracts the customer's ID from the JWT claim (NameIdentifier).
    /// The agent's AssignedAgentId is written separately by TicketsController when an agent claims a ticket.
    /// </summary>
    private Guid? GetCustomerId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(raw, out var id) ? id : null;
    }

    private async Task<string> ResolveCustomerName(Guid customerId)
    {
        var customerIdStr = customerId.ToString();
        var customer = await db.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.AuthId == customerIdStr);
        return customer is null ? "Customer" : $"{customer.FirstName} {customer.LastName}";
    }
}

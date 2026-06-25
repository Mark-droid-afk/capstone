using System.Security.Claims;
using CRM.Application.DTOs.Tickets;
using CRM.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/tickets")]
public class TicketsController(ITicketService ticketService) : ControllerBase
{
    [HttpGet("available")]
    public async Task<IActionResult> GetAvailable([FromQuery] GetTicketsRequest request) =>
        Ok(await ticketService.GetAvailableAsync(request));

    [HttpGet("claimed")]
    public async Task<IActionResult> GetClaimed([FromQuery] GetTicketsRequest request)
    {
        var agentId = GetAgentId();
        if (agentId is null) return Unauthorized();

        return Ok(await ticketService.GetClaimedAsync(agentId.Value, request));
    }

    [HttpGet("resolved")]
    public async Task<IActionResult> GetResolved([FromQuery] GetTicketsRequest request)
    {
        var agentId = GetAgentId();
        if (agentId is null) return Unauthorized();

        return Ok(await ticketService.GetResolvedAsync(agentId.Value, request));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await ticketService.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPatch("{id:guid}/claim")]
    public async Task<IActionResult> Claim(Guid id)
    {
        var agentId = GetAgentId();
        if (agentId is null) return Unauthorized();

        try
        {
            var result = await ticketService.ClaimAsync(id, agentId.Value);
            return result is null ? NotFound() : Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:guid}/unclaim")]
    public async Task<IActionResult> Unclaim(Guid id)
    {
        var agentId = GetAgentId();
        if (agentId is null) return Unauthorized();

        try
        {
            var result = await ticketService.UnclaimAsync(id, agentId.Value);
            return result is null ? NotFound() : Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:guid}/resolve")]
    public async Task<IActionResult> Resolve(Guid id)
    {
        var agentId = GetAgentId();
        if (agentId is null) return Unauthorized();

        try
        {
            var result = await ticketService.ResolveAsync(id, agentId.Value);
            return result is null ? NotFound() : Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private Guid? GetAgentId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(raw, out var id) ? id : null;
    }
}
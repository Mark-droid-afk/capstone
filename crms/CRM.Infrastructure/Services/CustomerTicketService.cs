using CRM.Application.DTOs.Tickets;
using CRM.Application.Interfaces;
using CRM.Domain.Enums;
using CRM.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Services;

public class CustomerTicketService(AppDbContext db, IWebHostEnvironment env) : ICustomerTicketService
{
    // ── Status mapping ────────────────────────────────────────────────────────
    //  Customer label  →  DB enum         DB enum       →  Customer label
    //  "Pending"       →  Available       Available     →  "Pending"
    //  "Ongoing"       →  Claimed         Claimed       →  "Ongoing"
    //  "Completed"     →  Resolved        Resolved      →  "Completed"
    //  "Cancelled"     →  Cancelled       Cancelled     →  "Cancelled"

    private static TicketStatus? ToDbStatus(string status) => status.ToLower() switch
    {
        "pending"   => TicketStatus.Available,
        "ongoing"   => TicketStatus.Claimed,
        "completed" => TicketStatus.Resolved,
        "cancelled" => TicketStatus.Cancelled,
        _           => null
    };

    private static string ToCustomerStatus(TicketStatus status) => status switch
    {
        TicketStatus.Available => "Pending",
        TicketStatus.Claimed   => "Ongoing",
        TicketStatus.Resolved  => "Completed",
        TicketStatus.Cancelled => "Cancelled",
        _                      => status.ToString()
    };

    // ── Operations ────────────────────────────────────────────────────────────

    public async Task<IEnumerable<CustomerTicketDto>> GetByStatusAsync(Guid customerId, string status)
    {
        var dbStatus = ToDbStatus(status);
        if (dbStatus is null) return [];

        var tickets = await db.Tickets
            .AsNoTracking()
            .Where(t => t.CustomerId == customerId && t.Status == dbStatus)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return tickets.Select(MapToDto);
    }

    public async Task<CustomerTicketDto?> GetByIdAsync(Guid ticketId, Guid customerId)
    {
        var ticket = await db.Tickets
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == ticketId && t.CustomerId == customerId);

        return ticket is null ? null : MapToDto(ticket);
    }

    public async Task<CustomerTicketDto> CreateAsync(
        Guid customerId,
        CreateCustomerTicketRequest request,
        Stream?  imageStream   = null,
        string? imageFileName  = null)
    {
        var ticket = new global::Ticket
        {
            Id          = Guid.NewGuid(),
            CustomerId  = customerId,
            Title       = request.Title,
            Description = request.Description,
            Type        = request.Type,
            Status      = TicketStatus.Available,
            CreatedAt   = DateTime.UtcNow,
            UpdatedAt   = DateTime.UtcNow
        };

        // Persist image to wwwroot/uploads/tickets/ if provided
        if (imageStream is not null && !string.IsNullOrEmpty(imageFileName))
        {
            var uploadsDir = Path.Combine(env.WebRootPath, "uploads", "tickets");
            Directory.CreateDirectory(uploadsDir);

            var ext      = Path.GetExtension(imageFileName);
            var fileName = $"{ticket.Id}{ext}";
            var filePath = Path.Combine(uploadsDir, fileName);

            await using var fileStream = File.Create(filePath);
            await imageStream.CopyToAsync(fileStream);

            ticket.ImageUrl = $"/uploads/tickets/{fileName}";
        }

        db.Tickets.Add(ticket);
        await db.SaveChangesAsync();

        return MapToDto(ticket);
    }

    public async Task<CustomerTicketDto?> CancelAsync(Guid ticketId, Guid customerId)
    {
        var ticket = await db.Tickets
            .FirstOrDefaultAsync(t => t.Id == ticketId && t.CustomerId == customerId);

        if (ticket is null) return null;

        if (ticket.Status != TicketStatus.Available)
            throw new InvalidOperationException("Only pending tickets can be cancelled.");

        ticket.Status    = TicketStatus.Cancelled;
        ticket.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return MapToDto(ticket);
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private static CustomerTicketDto MapToDto(global::Ticket t) => new()
    {
        Id             = t.Id,
        Title          = t.Title,
        Description    = t.Description,
        Type           = t.Type,
        Status         = ToCustomerStatus(t.Status),
        ImageUrl       = t.ImageUrl,
        ClaimedByName  = null,           // populated in a future iteration with agent name lookup
        ConversationId = t.ConversationId,
        CreatedAt      = t.CreatedAt,
        UpdatedAt      = t.UpdatedAt
    };
}

using CRM.Application.DTOs.Tickets;

namespace CRM.Application.Interfaces;

public interface ICustomerTicketService
{
    /// <summary>Returns all tickets for a customer filtered by status (Pending/Ongoing/Completed/Cancelled).</summary>
    Task<IEnumerable<CustomerTicketDto>> GetByStatusAsync(Guid customerId, string status);

    /// <summary>Returns a single ticket if it belongs to the customer.</summary>
    Task<CustomerTicketDto?> GetByIdAsync(Guid ticketId, Guid customerId);

    /// <summary>
    /// Creates a new ticket. Pass <paramref name="imageStream"/> + <paramref name="imageFileName"/>
    /// when the customer attaches a file; both default to null for text-only tickets.
    /// Image persistence is handled inside the Infrastructure layer.
    /// </summary>
    Task<CustomerTicketDto> CreateAsync(
        Guid customerId,
        CreateCustomerTicketRequest request,
        Stream?  imageStream    = null,
        string? imageFileName  = null);

    /// <summary>Cancels a ticket — only allowed while status is Pending (Available).</summary>
    Task<CustomerTicketDto?> CancelAsync(Guid ticketId, Guid customerId);
}

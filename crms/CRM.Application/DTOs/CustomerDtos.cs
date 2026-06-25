namespace CRM.Application.DTOs;

public record GetCustomersRequest(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    string? Status = null,
    string? Type = null
);

public record CreateCustomerRequest(
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string CustomerType,
    string? Address = null,
    string? AuthId = null
);

public record UpdateCustomerStatusRequest(string Status);

public record UpdateCustomerTypeRequest(string CustomerType);

public record UpdateCustomerNotesRequest(string Notes);

public record UpdateCustomerAddressRequest(string Address);

public record CustomerResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? Address,
    string? ProfileImage,
    string? Notes,
    string? AuthId,
    string Status,
    string CustomerType,
    DateTime CreatedAt
);

public record PaginatedResponse<T>(
    IEnumerable<T> Data,
    int Total,
    int Page,
    int PageSize
);
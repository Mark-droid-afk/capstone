namespace CRM.Application.DTOs;

public record GetOrderHistoryRequest(
    Guid CustomerId,
    int Page = 1,
    int PageSize = 10
);

public record OrderItemResponse(
    string ProductName,
    int Quantity,
    decimal Price
);

public record OrderResponse(
    Guid Id,
    string OrderNumber,
    string Status,
    decimal TotalAmount,
    IEnumerable<OrderItemResponse> Items,
    DateTime CreatedAt
);
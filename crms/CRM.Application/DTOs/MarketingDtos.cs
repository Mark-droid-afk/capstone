namespace CRM.Application.DTOs;

public record GetMarketingHistoryRequest(
    Guid CustomerId,
    int Page = 1,
    int PageSize = 10
);

public record MarketingHistoryResponse(
    Guid Id,
    string Title,
    string Description,
    string Channel,
    string InteractionType,
    DateTime SentAt
);
using CRM.Application.DTOs;

namespace CRM.Application.Interfaces;

public interface IMarketingService
{
    Task<PaginatedResponse<MarketingHistoryResponse>> GetHistoryAsync(GetMarketingHistoryRequest request);
}
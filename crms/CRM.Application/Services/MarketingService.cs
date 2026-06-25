using CRM.Application.DTOs;
using CRM.Application.Interfaces;

namespace CRM.Application.Services;

public class MarketingService(IMarketingRepository repository) : IMarketingService
{
    public async Task<PaginatedResponse<MarketingHistoryResponse>> GetHistoryAsync(GetMarketingHistoryRequest request)
    {
        var (data, total) = await repository.GetHistoryAsync(request);
        return new PaginatedResponse<MarketingHistoryResponse>(
            data.Select(m => new MarketingHistoryResponse(
                m.Id, m.Title, m.Description,
                m.Channel.ToString(), m.InteractionType.ToString(), m.SentAt)),
            total, request.Page, request.PageSize);
    }
}
using CRM.Application.DTOs;
using CRM.Domain.Entities;

namespace CRM.Application.Interfaces;

public interface IMarketingRepository
{
    Task<(IEnumerable<MarketingHistory> Data, int Total)> GetHistoryAsync(GetMarketingHistoryRequest request);
    Task AddAsync(MarketingHistory history);
}
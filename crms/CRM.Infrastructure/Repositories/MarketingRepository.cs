using CRM.Application.DTOs;
using CRM.Application.Interfaces;
using CRM.Domain.Entities;
using CRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Repositories;

public class MarketingRepository(AppDbContext db) : IMarketingRepository
{
    public async Task<(IEnumerable<MarketingHistory> Data, int Total)> GetHistoryAsync(GetMarketingHistoryRequest request)
    {
        var query = db.MarketingHistories
            .Where(m => m.CustomerId == request.CustomerId);

        var total = await query.CountAsync();

        var data = await query
            .OrderByDescending(m => m.SentAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return (data, total);
    }

    public async Task AddAsync(MarketingHistory history)
    {
        db.MarketingHistories.Add(history);
        await db.SaveChangesAsync();
    }
}
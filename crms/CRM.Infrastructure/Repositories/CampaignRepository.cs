using CRM.Application.Interfaces;
using CRM.Domain.Entities;
using CRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Repositories;

public class CampaignRepository(AppDbContext db) : ICampaignRepository
{
    public async Task<(IEnumerable<Campaign> Data, int Total)> GetAllAsync(
        CampaignStatus[]? statuses, int page, int pageSize, string? search)
    {
        var query = db.Campaigns.Include(c => c.Template).AsQueryable();

        if (statuses is { Length: > 0 })
            query = query.Where(c => statuses.Contains(c.Status));

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(c =>
                c.Title.Contains(search) ||
                c.Subject.Contains(search) ||
                c.Description.Contains(search));

        var total = await query.CountAsync();
        var data  = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (data, total);
    }

    public async Task<Campaign?> GetByIdAsync(Guid id) =>
        await db.Campaigns.Include(c => c.Template).FirstOrDefaultAsync(c => c.Id == id);

    public async Task<Campaign> CreateAsync(Campaign campaign)
    {
        db.Campaigns.Add(campaign);
        await db.SaveChangesAsync();
        return campaign;
    }

    public async Task UpdateAsync(Campaign campaign)
    {
        db.Campaigns.Update(campaign);
        await db.SaveChangesAsync();
    }

    public async Task<IEnumerable<CampaignTemplate>> GetTemplatesAsync() =>
        await db.CampaignTemplates.OrderBy(t => t.Name).ToListAsync();

    public async Task<CampaignTemplate?> GetTemplateByIdAsync(Guid id) =>
        await db.CampaignTemplates.FindAsync(id);

    public async Task<IEnumerable<Campaign>> GetPendingScheduledAsync() =>
        await db.Campaigns
            .Where(c => c.Status == CampaignStatus.Scheduled && c.ScheduledAt <= DateTime.UtcNow)
            .ToListAsync();

    public async Task<IEnumerable<Campaign>> GetActiveRecurringAsync() =>
        await db.Campaigns
            .Where(c => c.Status == CampaignStatus.Recurring)
            .ToListAsync();
}

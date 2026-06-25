using CRM.Application.DTOs;
using CRM.Domain.Entities;

namespace CRM.Application.Interfaces;

public interface ICampaignRepository
{
    Task<(IEnumerable<Campaign> Data, int Total)> GetAllAsync(
        CampaignStatus[]? statuses, int page, int pageSize, string? search);

    Task<Campaign?> GetByIdAsync(Guid id);
    Task<Campaign> CreateAsync(Campaign campaign);
    Task UpdateAsync(Campaign campaign);

    // Templates
    Task<IEnumerable<CampaignTemplate>> GetTemplatesAsync();
    Task<CampaignTemplate?> GetTemplateByIdAsync(Guid id);

    // Scheduler helpers
    Task<IEnumerable<Campaign>> GetPendingScheduledAsync();
    Task<IEnumerable<Campaign>> GetActiveRecurringAsync();
}

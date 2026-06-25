using CRM.Application.DTOs;
using CRM.Domain.Entities;

namespace CRM.Application.Interfaces;

public interface ICampaignService
{
    Task<PaginatedResponse<CampaignResponse>> GetAllAsync(GetCampaignsRequest request);
    Task<CampaignResponse?> GetByIdAsync(Guid id);
    Task<CampaignResponse> CreateAsync(CreateCampaignRequest request);
    Task<CampaignResponse> DraftAsync(DraftCampaignRequest request);
    Task<IEnumerable<CampaignTemplateResponse>> GetTemplatesAsync();

    /// <summary>Called by the background scheduler every minute.</summary>
    Task ProcessScheduledCampaignsAsync();

    /// <summary>Called by the background scheduler every minute.</summary>
    Task ProcessRecurringCampaignsAsync();
}

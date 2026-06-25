using CRM.Application.Interfaces;

namespace CRM.API.BackgroundServices;

/// <summary>
/// Runs every 60 seconds.
/// - Fires scheduled campaigns whose ScheduledAt is now in the past.
/// - Sends recurring campaigns on their matching weekday (once per day).
/// </summary>
public class CampaignSchedulerService(IServiceScopeFactory scopeFactory, ILogger<CampaignSchedulerService> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Campaign Scheduler started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var service = scope.ServiceProvider.GetRequiredService<ICampaignService>();

                await service.ProcessScheduledCampaignsAsync();
                await service.ProcessRecurringCampaignsAsync();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error during campaign scheduling tick.");
            }

            await Task.Delay(TimeSpan.FromSeconds(60), stoppingToken);
        }

        logger.LogInformation("Campaign Scheduler stopped.");
    }
}

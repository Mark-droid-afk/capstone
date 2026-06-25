using Infrastructures.Externals;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Applications.BackgroundServices;

public class CustomerSyncWorker(
    CustomerSyncChannel channel,
    CrmClient crmClient,
    ILogger<CustomerSyncWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var message in channel.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                await crmClient.SyncCustomerAsync(message);
                logger.LogInformation("Synced customer {Email} to CRM.", message.Email);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to sync customer {Email} to CRM.", message.Email);
            }
        }
    }
}
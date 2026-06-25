using System.Threading.Channels;

namespace Infrastructures.Externals;

public class CustomerSyncChannel
{
    private readonly Channel<CustomerSyncMessage> _channel =
        Channel.CreateUnbounded<CustomerSyncMessage>();

    public ChannelWriter<CustomerSyncMessage> Writer => _channel.Writer;
    public ChannelReader<CustomerSyncMessage> Reader => _channel.Reader;
}

public record CustomerSyncMessage(
    string Email,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    string AuthId
);
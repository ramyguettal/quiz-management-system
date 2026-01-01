
using quiz_management_system.Application.Interfaces;

public sealed class SignalRNotificationDispatcher(
 )
    : ISignalRNotificationDispatcher, IScopedService
{
    public Task SendAsync(
        DomainNotification notification)
    {
        return notification.Type switch
        {

        };
    }
}
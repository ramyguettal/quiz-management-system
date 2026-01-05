namespace quiz_management_system.Application.Interfaces;

public interface ISignalRNotificationDispatcher
{
    Task SendAsync(DomainNotification notification);
}
namespace quiz_management_system.Application.Interfaces;

public interface IUnifiedNotificationDispatcher
{
    Task EnqueueAsync(
        DomainNotification notification,
        CancellationToken ct);
}
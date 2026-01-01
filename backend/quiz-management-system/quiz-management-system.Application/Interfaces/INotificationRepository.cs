using quiz_management_system.Domain.Common.ResultPattern.Result;

public interface INotificationRepository
{
    Task<Result> MarkAsReadAsync(
        Guid notificationId,
        Guid userId,
        CancellationToken cancellationToken);

    Task AddAsync(
        DomainNotification notification,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<DomainNotification>> GetByUserAsync(
        Guid userId,
        CancellationToken cancellationToken);


}
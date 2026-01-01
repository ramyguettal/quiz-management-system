
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Infrastructure.NotificationsDispatcher;

public sealed class NotificationRepository(IAppDbContext db) : INotificationRepository, IScopedService
{


    public async Task<IReadOnlyList<DomainNotification>> GetByUserAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        return await db.Notifications
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(
         DomainNotification notification,
         CancellationToken cancellationToken)
    {
        await db.Notifications.AddAsync(notification, cancellationToken);
    }

    public async Task<Result> MarkAsReadAsync(
        Guid notificationId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        DomainNotification? notification = await db.Notifications
            .Where(n => n.Id == notificationId && n.UserId == userId)
            .FirstOrDefaultAsync(cancellationToken);

        if (notification is null)
            return Result.Failure(DomainError.NotFound(nameof(DomainNotification)));

        notification.MarkAsRead();

        return Result.Success();
    }
}
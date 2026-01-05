using Hangfire;
using quiz_management_system.Application.Interfaces;

public sealed class UnifiedNotificationDispatcher(
    IAppDbContext context,
    IBackgroundJobClient backgroundJobs)
    : IUnifiedNotificationDispatcher, IScopedService
{
    public async Task EnqueueAsync(
        DomainNotification notification,
        CancellationToken ct)
    {
        context.DisableDomainEvents = true;
        context.Notifications.Add(notification);
        await context.SaveChangesAsync(ct);
        context.DisableDomainEvents = false;
        backgroundJobs.Enqueue<NotificationDispatchJob>(
            job => job.ExecuteAsync(notification.Id, CancellationToken.None));
    }

}

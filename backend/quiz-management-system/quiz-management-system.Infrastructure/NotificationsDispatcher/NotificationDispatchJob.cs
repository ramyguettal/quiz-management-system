using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Interfaces;

public sealed class NotificationDispatchJob(
IAppDbContext context,
ISignalRNotificationDispatcher signalRDispatcher) : ITransientService
{
    public async Task ExecuteAsync(Guid notificationId, CancellationToken ct)
    {
        var notification = await context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId, ct);


        await signalRDispatcher.SendAsync(notification);



    }
}
namespace quiz_management_system.Application.Interfaces;

public interface INotificationService : IScopedService
{
    Task SendEmailAsync(string to, string subject, string htmBody, CancellationToken cancellationToken = default);
}

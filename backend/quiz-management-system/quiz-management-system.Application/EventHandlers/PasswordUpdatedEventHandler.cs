using MediatR;
using Microsoft.Extensions.Options;
using quiz_management_system.Application.Configuration;
using quiz_management_system.Application.Events;
using quiz_management_system.Application.Interfaces;

namespace quiz_management_system.Application.EventHandlers;

public sealed class PasswordUpdatedEventHandler
    : INotificationHandler<PasswordUpdatedEvent>
{
    private readonly INotificationService _notificationService;
    private readonly ResendTemplates _templates;

    public PasswordUpdatedEventHandler(
        INotificationService notificationService,
        IOptions<ResendTemplates> templates)
    {
        _notificationService = notificationService;
        _templates = templates.Value;
    }

    public async Task Handle(
        PasswordUpdatedEvent e,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(e.Email))
            return;

        await _notificationService.SendEmailAsync(
            to: e.Email,
            subject: "Your Password Has Been Updated",
            templateId: _templates.PasswordUpdated,
            variables: new Dictionary<string, object>
            {
                ["UserName"] = e.FullName,
                ["Email"] = e.Email,
                ["Date"] = e.Timestamp.ToString("yyyy-MM-dd HH:mm:ss 'UTC'"),
                ["IPAddress"] = e.IpAddress,
                ["Year"] = DateTime.UtcNow.Year.ToString()
            },
            cancellationToken: cancellationToken);
    }
}

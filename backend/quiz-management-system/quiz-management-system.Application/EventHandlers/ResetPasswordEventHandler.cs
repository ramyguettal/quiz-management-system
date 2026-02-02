using MediatR;
using Microsoft.Extensions.Options;
using quiz_management_system.Application.Configuration;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Events;

namespace quiz_management_system.Application.EventHandlers;

public sealed class ResetPasswordEventHandler
    : INotificationHandler<ResetPasswordEvent>
{
    private readonly INotificationService _notificationService;
    private readonly IIdentityService _identityService;
    private readonly ResendTemplates _templates;

    public ResetPasswordEventHandler(
        INotificationService notificationService,
        IIdentityService identityService,
        IOptions<ResendTemplates> templates)
    {
        _notificationService = notificationService;
        _identityService = identityService;
        _templates = templates.Value;
    }

    public async Task Handle(ResetPasswordEvent notification, CancellationToken cancellationToken)
    {
        Result<string> codeResult = await _identityService
            .GeneratePasswordResetCodeAsync(notification.userId, cancellationToken);

        if (codeResult.IsFailure)
            return;

        string resetToken = codeResult.TryGetValue();
        string resetLink = $"http://web.quizflow.online/reset-password?userId={notification.userId}&code={resetToken}";

        await _notificationService.SendEmailAsync(
            to: notification.Email,
            subject: "Reset Your QuizFlow Password",
            templateId: _templates.ResetPassword,
            variables: new Dictionary<string, object>
            {
                ["FullName"] = notification.FullName,
                ["Email"] = notification.Email,
                ["ResetPasswordLink"] = resetLink,
                ["Role"] = notification.Role,
                ["Year"] = DateTime.UtcNow.Year.ToString()
            },
            cancellationToken: cancellationToken);
    }
}

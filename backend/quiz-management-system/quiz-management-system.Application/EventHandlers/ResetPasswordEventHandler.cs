using MediatR;
using quiz_management_system.Application.Constants;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Events;

namespace quiz_management_system.Application.EventHandlers;

public sealed class ResetPasswordEventHandler
    : INotificationHandler<ResetPasswordEvent>
{
    private readonly INotificationService _notificationService;
    private readonly IIdentityService _identityService;
    private readonly IEmailTemplateLoader _templateLoader;
    private readonly IEmailBodyBuilder _bodyBuilder;

    public ResetPasswordEventHandler(
        INotificationService notificationService,
        IIdentityService identityService,
        IEmailTemplateLoader templateLoader,
        IEmailBodyBuilder bodyBuilder)
    {
        _notificationService = notificationService;
        _identityService = identityService;
        _templateLoader = templateLoader;
        _bodyBuilder = bodyBuilder;
    }

    public async Task Handle(ResetPasswordEvent notification, CancellationToken cancellationToken)
    {

        Result<string> codeResult = await _identityService
            .GeneratePasswordResetCodeAsync(notification.userId, cancellationToken);

        if (codeResult.IsFailure)
        {

            return;
        }

        string resetToken = codeResult.TryGetValue();



        await SendPasswordResetAsync(
            userId: notification.userId,
            email: notification.Email,
            fullName: notification.FullName,
            code: resetToken,
            role: notification.Role,
            cancellationToken: cancellationToken);
    }

    private async Task SendPasswordResetAsync(
        Guid userId,
        string email,
        string fullName,
        string code,
        string role,
        CancellationToken cancellationToken)
    {

        string template = await _templateLoader.LoadTemplateAsync(
            EmailTemplates.ResetPassword,
            cancellationToken);


        string resetLink = $"https://frontend.example.com/reset-password?userId={userId}&code={code}";

        string body = _bodyBuilder.Build(template, new Dictionary<string, string>
        {
            ["FullName"] = fullName,
            ["Email"] = email,
            ["ResetPasswordLink"] = resetLink,
            ["Role"] = role,
            ["Year"] = DateTime.UtcNow.Year.ToString()
        });

        await _notificationService.SendEmailAsync(
            to: email,
            subject: "Reset Your QuizFlow Password",
            htmBody: body,
            cancellationToken: cancellationToken);
    }
}

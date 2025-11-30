using Hangfire;
using Microsoft.AspNetCore.Identity.UI.Services;
using quiz_management_system.Application.Interfaces;

namespace quiz_management_system.Infrastructure.Services;

public sealed class NotificationService(IEmailSender _emailSender) : INotificationService
{



    public Task SendEmailAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        BackgroundJob.Enqueue<NotificationService>(x =>
            x.SendEmailNowAsync(to, subject, htmlBody));

        return Task.CompletedTask;
    }


    public async Task SendEmailNowAsync(string to, string subject, string htmlBody)
    {
        await _emailSender.SendEmailAsync(to, subject, htmlBody);
    }



}
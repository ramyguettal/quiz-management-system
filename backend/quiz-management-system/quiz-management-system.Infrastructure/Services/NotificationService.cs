using Hangfire;
using Microsoft.Extensions.Logging;
using quiz_management_system.Application.Interfaces;

namespace quiz_management_system.Infrastructure.Services;

/// <summary>
/// High-level notification service that enqueues email sending as background jobs.
/// </summary>
public sealed class NotificationService : INotificationService, IScopedService
{
    private readonly IEmailSender _emailSender;
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IEmailSender emailSender,
        IBackgroundJobClient backgroundJobClient,
        ILogger<NotificationService> logger)
    {
        _emailSender = emailSender;
        _backgroundJobClient = backgroundJobClient;
        _logger = logger;
    }

    /// <inheritdoc/>
    public Task SendEmailAsync(
        string to,
        string subject,
        Guid templateId,
        Dictionary<string, object> variables,
        CancellationToken cancellationToken = default)
    {
        // Enqueue email sending as a background job
        _backgroundJobClient.Enqueue<IEmailSender>(
            sender => sender.SendEmailAsync(to, subject, templateId, variables, CancellationToken.None));

        _logger.LogInformation("Enqueued email job to {Recipient}, template {TemplateId}", to, templateId);

        return Task.CompletedTask;
    }

    /// <inheritdoc/>
    public Task SendBatchEmailsAsync(
        IEnumerable<BatchEmailRequest> emails,
        CancellationToken cancellationToken = default)
    {
        var emailList = emails.ToList();
        if (emailList.Count == 0)
            return Task.CompletedTask;

        // Enqueue batch email sending as a background job
        _backgroundJobClient.Enqueue<IEmailSender>(
            sender => sender.SendBatchEmailsAsync(emailList, CancellationToken.None));

        _logger.LogInformation("Enqueued batch email job with {Count} emails", emailList.Count);

        return Task.CompletedTask;
    }
}
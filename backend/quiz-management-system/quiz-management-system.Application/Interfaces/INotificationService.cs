namespace quiz_management_system.Application.Interfaces;

/// <summary>
/// High-level notification service for sending emails with job enqueueing support.
/// </summary>
public interface INotificationService
{
    /// <summary>
    /// Sends an email using a Resend template (enqueues as background job).
    /// </summary>
    Task SendEmailAsync(
        string to,
        string subject,
        Guid templateId,
        Dictionary<string, object> variables,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a batch of emails using Resend templates (enqueues as background job).
    /// </summary>
    Task SendBatchEmailsAsync(
        IEnumerable<BatchEmailRequest> emails,
        CancellationToken cancellationToken = default);
}

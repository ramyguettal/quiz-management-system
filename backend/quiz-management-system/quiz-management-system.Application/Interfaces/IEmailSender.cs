namespace quiz_management_system.Application.Interfaces;

/// <summary>
/// Low-level email sending interface (implemented by ResendEmailSender).
/// </summary>
public interface IEmailSender : IScopedService
{
    /// <summary>
    /// Sends an email using a Resend template.
    /// </summary>
    Task SendEmailAsync(
        string to,
        string subject,
        Guid templateId,
        Dictionary<string, object> variables,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a batch of emails using Resend templates.
    /// </summary>
    Task SendBatchEmailsAsync(
        IEnumerable<BatchEmailRequest> emails,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Request for a single email in a batch.
/// </summary>
public sealed record BatchEmailRequest(
    string To,
    string Subject,
    Guid TemplateId,
    Dictionary<string, object> Variables
);

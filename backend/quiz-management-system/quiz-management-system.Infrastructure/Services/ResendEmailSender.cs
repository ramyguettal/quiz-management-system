using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Infrastructure.Email;
using Resend;

namespace quiz_management_system.Infrastructure.Services;

/// <summary>
/// Low-level email sender using Resend API with template support.
/// </summary>
public sealed class ResendEmailSender : IEmailSender,IScopedService
{
    private readonly ResendSettings _settings;
    private readonly ILogger<ResendEmailSender> _logger;
    private readonly IResend _resend;

    public ResendEmailSender(
        IOptions<ResendSettings> settings,
        ILogger<ResendEmailSender> logger,
        IResend resend)
    {
        _settings = settings.Value;
        _logger = logger;
        _resend = resend;
    }

    /// <inheritdoc/>
    public async Task SendEmailAsync(
        string to,
        string subject,
        Guid templateId,
        Dictionary<string, object> variables,
        CancellationToken cancellationToken = default)
    {
        var message = new EmailMessage
        {
            From = _settings.From,
            Subject = subject,
            Template = new EmailMessageTemplate
            {
                TemplateId = templateId,
                Variables = variables
            }
        };

        message.To.Add(to);

        try
        {
            var result = await _resend.EmailSendAsync(message, cancellationToken);
            _logger.LogInformation(
                "Email sent via Resend template to {Recipient}. TemplateId={TemplateId}, Id={Id}",
                to, templateId, result.Content);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email via Resend to {Recipient}", to);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task SendBatchEmailsAsync(
        IEnumerable<BatchEmailRequest> emails,
        CancellationToken cancellationToken = default)
    {
        var emailList = emails.ToList();
        if (emailList.Count == 0)
            return;

        var messages = emailList.Select(e => new EmailMessage
        {
            From = _settings.From,
            Subject = e.Subject,
            To = { e.To },
            Template = new EmailMessageTemplate
            {
                TemplateId = e.TemplateId,
                Variables = e.Variables
            }
        }).ToList();

        try
        {
            var result = await _resend.EmailBatchAsync(messages, cancellationToken);
            _logger.LogInformation(
                "Batch email sent via Resend. Count={Count}",
                result.Content?.Count ?? 0);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending batch email via Resend. Count={Count}", emailList.Count);
            throw;
        }
    }
}

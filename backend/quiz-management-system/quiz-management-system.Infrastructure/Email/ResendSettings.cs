namespace quiz_management_system.Infrastructure.Email;

/// <summary>
/// Resend API settings for email sending.
/// </summary>
public sealed class ResendSettings
{
    public const string SectionName = "Resend";

    public string ApiKey { get; set; } = string.Empty;
    public string From { get; set; } = string.Empty;
}

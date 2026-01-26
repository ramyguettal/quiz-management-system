namespace quiz_management_system.Application.Configuration;

/// <summary>
/// Resend email template IDs. Configured in appsettings.json under "Resend:Templates".
/// </summary>
public sealed class ResendTemplates
{
    public const string SectionName = "Resend:Templates";

    public Guid ResetPassword { get; set; }
    public Guid PasswordUpdated { get; set; }
    public Guid QuizUpcoming { get; set; }
    public Guid QuizStarted { get; set; }
    public Guid QuizEnded { get; set; }
    public Guid QuizResultsReleased { get; set; }
}

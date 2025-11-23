using quiz_management_system.Domain.Common.ResultPattern.Error;

namespace quiz_management_system.Domain.Users.Abstraction.NotificationPreferencesFolder;

public sealed record NotificationPreferencesError(DomainErrorCode DomainErrorCode, string Type, string Description)
       : Error(DomainErrorCode, Type, Description)
{
    public static NotificationPreferencesError InvalidState(string message) =>
        new(DomainErrorCode.InvalidState, "Notification.InvalidState", message);

    public static NotificationPreferencesError Missing(string message) =>
        new(DomainErrorCode.InvalidState, "Notification.Missing", message);
}

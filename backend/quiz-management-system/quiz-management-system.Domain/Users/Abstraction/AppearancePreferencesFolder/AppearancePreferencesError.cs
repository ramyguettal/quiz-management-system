using quiz_management_system.Domain.Common.ResultPattern.Error;

namespace quiz_management_system.Domain.Users.Abstraction.AppearancePreferencesFolder;

public sealed record AppearancePreferencesError(DomainErrorCode DomainErrorCode, string Type, string Description)
        : Error(DomainErrorCode, Type, Description)
{
    public static AppearancePreferencesError InvalidTheme(string message) =>
        new(DomainErrorCode.InvalidState, "Appearance.InvalidTheme", message);

    public static AppearancePreferencesError InvalidColorScheme(string message) =>
        new(DomainErrorCode.InvalidState, "Appearance.InvalidColorScheme", message);

    public static AppearancePreferencesError InvalidFontSize(string message) =>
        new(DomainErrorCode.InvalidState, "Appearance.InvalidFontSize", message);

    public static AppearancePreferencesError InvalidState(string message) =>
        new(DomainErrorCode.InvalidState, "Appearance.InvalidState", message);
}
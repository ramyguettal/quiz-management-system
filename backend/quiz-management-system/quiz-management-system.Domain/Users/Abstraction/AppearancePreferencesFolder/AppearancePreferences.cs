using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Domain.Users.Abstraction.AppearancePreferencesFolder;

public sealed class AppearancePreferences : Entity
{
    public string Theme { get; private set; } = "Light";
    public string ColorScheme { get; private set; } = "Blue";
    public string FontSize { get; private set; } = "Medium";
    public bool CompactMode { get; private set; }
    public bool Animations { get; private set; }

    private static readonly string[] AllowedThemes = { "Light", "Dark", "System" };
    private static readonly string[] AllowedFontSizes = { "Small", "Medium", "Large" };

    private AppearancePreferences() { }

    private AppearancePreferences(
        string theme,
        string colorScheme,
        string fontSize,
        bool compactMode,
        bool animations)
    {
        Theme = theme;
        ColorScheme = colorScheme;
        FontSize = fontSize;
        CompactMode = compactMode;
        Animations = animations;
    }


    public static Result<AppearancePreferences> Create(
        string theme,
        string colorScheme,
        string fontSize,
        bool compactMode,
        bool animations)
    {
        var validation = Validate(theme, colorScheme, fontSize);
        if (validation.IsFailure)
            return Result.Failure<AppearancePreferences>(validation.TryGetError());

        return Result.Success(
            new AppearancePreferences(theme, colorScheme, fontSize, compactMode, animations));
    }


    public Result Update(
        string theme,
        string colorScheme,
        string fontSize,
        bool compactMode,
        bool animations)
    {
        var validation = Validate(theme, colorScheme, fontSize);
        if (validation.IsFailure)
            return Result.Failure(validation.TryGetError());

        Theme = theme;
        ColorScheme = colorScheme;
        FontSize = fontSize;
        CompactMode = compactMode;
        Animations = animations;

        return Result.Success();
    }

    public Result Update(
        AppearancePreferences appearancePreferences)
    {
        var validation = Validate(appearancePreferences.Theme, appearancePreferences.ColorScheme, appearancePreferences.FontSize);
        if (validation.IsFailure)
            return Result.Failure(validation.TryGetError());

        Theme = appearancePreferences.Theme;
        ColorScheme = appearancePreferences.ColorScheme;
        FontSize = appearancePreferences.FontSize;
        CompactMode = appearancePreferences.CompactMode;
        Animations = appearancePreferences.Animations;

        return Result.Success();
    }


    private static Result Validate(
        string theme,
        string colorScheme,
        string fontSize)
    {
        if (string.IsNullOrWhiteSpace(theme) || !AllowedThemes.Contains(theme))
        {
            return Result.Failure(
                AppearancePreferencesError.InvalidTheme("Theme must be Light, Dark, or System."));
        }

        if (string.IsNullOrWhiteSpace(colorScheme))
        {
            return Result.Failure(
                AppearancePreferencesError.InvalidColorScheme("Color scheme cannot be empty."));
        }

        if (string.IsNullOrWhiteSpace(fontSize) || !AllowedFontSizes.Contains(fontSize))
        {
            return Result.Failure(
                AppearancePreferencesError.InvalidFontSize("Font size must be Small, Medium, or Large."));
        }

        return Result.Success();
    }


    public static AppearancePreferences Default()
        => new("Light", "Blue", "Medium", false, true);
}

using Dodo.Primitives;
using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.Events;
using quiz_management_system.Domain.Users.Abstraction.AppearancePreferencesFolder;
using quiz_management_system.Domain.Users.Abstraction.NotificationPreferencesFolder;


namespace quiz_management_system.Domain.Users.Abstraction;




public abstract class DomainUser : AggregateRoot, IAuditableEntity
{
    public string? PictureUrl { get; private set; } = string.Empty;

    public string FullName { get; protected set; } = string.Empty;
    public string Email { get; protected set; } = string.Empty;

    public Uuid AppearancePreferencesId { get; protected set; }
    public AppearancePreferences? Appearance { get; protected set; } = AppearancePreferences.Default();

    public Uuid NotificationPreferencesId { get; protected set; }
    public NotificationPreferences? Notifications { get; protected set; } = NotificationPreferences.Default();

    public DateTimeOffset CreatedAtUtc { get; protected set; }
    public string? CreatedBy { get; protected set; }
    public DateTimeOffset LastModifiedUtc { get; protected set; }
    public string? LastModifiedBy { get; protected set; }


    DateTimeOffset IAuditableEntity.CreatedAtUtc
    {
        get => CreatedAtUtc;
        set => CreatedAtUtc = value;
    }

    string? IAuditableEntity.CreatedBy
    {
        get => CreatedBy;
        set => CreatedBy = value;
    }

    DateTimeOffset IAuditableEntity.LastModifiedUtc
    {
        get => LastModifiedUtc;
        set => LastModifiedUtc = value;
    }

    string? IAuditableEntity.LastModifiedBy
    {
        get => LastModifiedBy;
        set => LastModifiedBy = value;
    }



    protected DomainUser() { }

    protected DomainUser(Uuid id, string fullName, string email) : base(id)
    {
        FullName = fullName;
        Email = email;
    }

    public Result UpdateAppearance(AppearancePreferences appearance)
    {
        if (appearance is null)
            return Result.Failure(
                DomainError.InvalidState(nameof(AppearancePreferences), "Appearance cannot be null."));

        var validation = AppearancePreferences.Create(
            appearance.Theme,
            appearance.ColorScheme,
            appearance.FontSize,
            appearance.CompactMode,
            appearance.Animations
        );

        if (validation.IsFailure)
            return Result.Failure(validation.TryGetError());

        var newPref = validation.TryGetValue();

        Appearance = newPref;
        AppearancePreferencesId = newPref.Id;

        return Result.Success();
    }


    public Result UpdateNotifications(NotificationPreferences notifications)
    {
        if (notifications is null)
            return Result.Failure(
                DomainError.InvalidState(nameof(NotificationPreferences), "Notifications cannot be null."));

        var validation = NotificationPreferences.Create(
            notifications.EmailNotifications,
            notifications.PushNotifications,
            notifications.WeeklyReports,
            notifications.SystemAlerts
        );

        if (validation.IsFailure)
            return Result.Failure(validation.TryGetError());

        var newPref = validation.TryGetValue();

        Notifications = newPref;
        NotificationPreferencesId = newPref.Id;

        return Result.Success();
    }
    public void FireUserCreatedEvent(string id, string email, string fullName, string role)
    {
        this.AddDomainEvent(new ResetPasswordEvent(id, email, fullName, role));
    }


}

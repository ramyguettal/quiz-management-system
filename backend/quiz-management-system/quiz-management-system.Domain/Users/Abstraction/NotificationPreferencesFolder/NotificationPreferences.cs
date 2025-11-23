using quiz_management_system.Domain.Common;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Domain.Users.Abstraction.NotificationPreferencesFolder;

public sealed class NotificationPreferences : Entity
{
    public bool EmailNotifications { get; private set; }
    public bool PushNotifications { get; private set; }
    public bool WeeklyReports { get; private set; }
    public bool SystemAlerts { get; private set; }

    private NotificationPreferences() { }

    private NotificationPreferences(
        bool email,
        bool push,
        bool weeklyReports,
        bool systemAlerts)
    {
        EmailNotifications = email;
        PushNotifications = push;
        WeeklyReports = weeklyReports;
        SystemAlerts = systemAlerts;
    }

    public static Result<NotificationPreferences> Create(
        bool email,
        bool push,
        bool weeklyReports,
        bool systemAlerts)
    {
        if (!email && !push && !weeklyReports && !systemAlerts)
        {
            return Result.Failure<NotificationPreferences>(
                NotificationPreferencesError.InvalidState(
                    "At least one notification type must be enabled."
                ));
        }

        return Result.Success(
            new NotificationPreferences(email, push, weeklyReports, systemAlerts));
    }

    public static NotificationPreferences Default()
        => new(
            email: true,
            push: false,
            weeklyReports: true,
            systemAlerts: true);
}
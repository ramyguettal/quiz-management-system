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


    private NotificationPreferences(
        Guid Id,
        bool email,
        bool push,
        bool weeklyReports,
        bool systemAlerts) : base(Id)
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
        => new(DefaultNotificationId,
            email: true,
            push: false,
            weeklyReports: true,
            systemAlerts: true);


    public static readonly Guid DefaultNotificationId =
        Guid.Parse("018f3f0d-9c2c-7ab1-96da-4b821eac09ff");
}
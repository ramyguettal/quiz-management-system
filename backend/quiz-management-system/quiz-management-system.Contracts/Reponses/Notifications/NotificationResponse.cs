using quiz_management_system.Domain.PushNotifications.Enums;

namespace quiz_management_system.Contracts.Responses.Notifications;

public sealed record NotificationResponse(
    Guid Id,
    string Title,
    string Body,
    bool IsRead,
    DateTime CreatedUtc,
    NotificationType Type,
    Dictionary<string, string>? Data
);
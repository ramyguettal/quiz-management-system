using quiz_management_system.Application.Common;

namespace quiz_management_system.Application.Events;

public sealed record PasswordUpdatedEvent(
    string Email,
    string FullName,
    string IpAddress,
    DateTime Timestamp
) : ApplicationEvent;

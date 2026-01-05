namespace quiz_management_system.Contracts.Reponses.Admin;

public sealed record AdminProfileResponse(
    Guid Id,
    string FullName,
    string Email,
    string? ProfileImageUrl,
    bool EmailNotifications,
    DateTimeOffset CreatedAtUtc
);

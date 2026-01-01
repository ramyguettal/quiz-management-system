namespace quiz_management_system.Contracts.Requests.Instructor;

public sealed record InstructorProfileResponse(
    Guid Id,
    string FullName,
    string Email,
    string Title,
    string PhoneNumber,
    string Department,
    string OfficeLocation,
    string Bio,
    string? ProfileImageUrl,
    bool EmailNotifications,
    DateTimeOffset CreatedAtUtc
);
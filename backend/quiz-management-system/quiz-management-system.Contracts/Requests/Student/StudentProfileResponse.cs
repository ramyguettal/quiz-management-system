namespace quiz_management_system.Contracts.Requests.Student;

public sealed record StudentProfileResponse(
    Guid Id,
    string FullName,
    string Email,
    Guid AcademicYearId,
    string AcademicYearNumber,
    string Status,
    string? ProfileImageUrl,
    bool EmailNotifications,
    DateTimeOffset CreatedAtUtc,
    StudentGroupInfo? Group
);

public sealed record StudentGroupInfo(
    Guid GroupId,
    string GroupNumber
);
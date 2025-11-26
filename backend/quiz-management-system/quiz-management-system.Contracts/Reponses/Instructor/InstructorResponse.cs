using quiz_management_system.Domain.Users.StudentsFolder.Enums;

namespace quiz_management_system.Contracts.Reponses.Instructor;

public sealed record InstructorResponse(
    Guid Id,
    string FullName,
    string Email,
    string Title,
    string PhoneNumber,
    string Department,
    string OfficeLocation,
    string Bio,
    StudentStatus Status
);
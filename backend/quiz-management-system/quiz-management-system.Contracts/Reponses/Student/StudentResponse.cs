using quiz_management_system.Domain.Users.StudentsFolder.Enums;

namespace quiz_management_system.Contracts.Reponses.Student;

public sealed record StudentResponse(
    Guid Id,
    string FullName,
    string Email,
    string AcademicYear,
    int CoursesCount,
    int QuizzesCount,
    UserStatus Status
);




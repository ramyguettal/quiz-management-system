namespace quiz_management_system.Contracts.Requests.Student;

public sealed record CreateStudentRequest(
    string Email,
    string FullName,
    string AcademicYear,
    string GroupNumber
);
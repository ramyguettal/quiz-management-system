namespace quiz_management_system.Contracts.Reponses.Courses;

public sealed record CourseResponse(
    Guid Id,
    Guid AcademicYearId,
    string Title,
    string AcademicYearNumber,
    int? StudentsEnrolled = null
);
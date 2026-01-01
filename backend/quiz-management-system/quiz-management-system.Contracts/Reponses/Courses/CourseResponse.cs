namespace quiz_management_system.Contracts.Reponses.Courses;

public record CourseResponse(
    Guid Id,
    Guid AcademicYearId,
    string Title,
    string Description,
    string Code,
    String AcademicYearNumber,
    int StudentCount = 0
);
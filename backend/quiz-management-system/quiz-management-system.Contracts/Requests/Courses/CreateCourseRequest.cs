namespace quiz_management_system.Contracts.Requests.Courses;

public sealed record CreateCourseRequest(
    string Title,
    string Description,
    string code,
    Guid AcademicYearId
);
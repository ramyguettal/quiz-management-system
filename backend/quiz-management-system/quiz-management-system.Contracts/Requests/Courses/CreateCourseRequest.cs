namespace quiz_management_system.Contracts.Requests.Courses;

public sealed record CreateCourseRequest(
    string Title,
    Guid AcademicYearId
);
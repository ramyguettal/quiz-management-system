namespace quiz_management_system.Contracts.Requests.Courses;

public sealed record UpdateCourseRequest(
    string Title,
    Guid AcademicYearId
);
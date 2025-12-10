namespace quiz_management_system.Contracts.Requests.Courses;

public sealed record UpdateInstructorCoursesRequest(
    IReadOnlyList<Guid> CourseIds
);

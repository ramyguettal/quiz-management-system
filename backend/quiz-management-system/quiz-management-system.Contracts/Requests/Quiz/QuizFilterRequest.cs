namespace quiz_management_system.Contracts.Requests.Quiz;

// Update the request record
public record QuizFilterRequest(
    Guid? CourseId,
    Guid? InstructorId,
    Guid? AcademicYearId,
    string? Status,
    string? Cursor,
    int PageSize = 20
);
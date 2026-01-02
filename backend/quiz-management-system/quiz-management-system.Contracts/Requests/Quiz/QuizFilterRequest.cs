using quiz_management_system.Contracts.Requests.Student;
using quiz_management_system.Domain.QuizesFolder.Enums;

namespace quiz_management_system.Contracts.Requests.Quiz;

// Update the request record
public record QuizFilterRequest(
    Guid? CourseId,
    Guid? InstructorId,
    Guid? AcademicYearId,
    QuizStatus? Status,
    TimeQuizStatus TimeQuizStatus,
    string? Cursor,
    int PageSize = 20
);
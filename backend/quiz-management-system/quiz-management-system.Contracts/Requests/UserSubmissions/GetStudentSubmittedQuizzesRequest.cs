namespace quiz_management_system.Contracts.Requests.UserSubmissions;

/// <summary>
/// Request for getting student's submitted quizzes with pagination.
/// </summary>
public sealed record GetStudentSubmittedQuizzesRequest(
    string? Cursor = null,
    int PageSize = 20,
    Guid? CourseId = null,
    SubmissionStatusFilter? Status = null
);

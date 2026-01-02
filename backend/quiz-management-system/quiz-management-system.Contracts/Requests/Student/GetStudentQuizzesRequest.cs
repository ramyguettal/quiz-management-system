namespace quiz_management_system.Contracts.Requests.Student;

public sealed record GetStudentQuizzesRequest(
    Guid? CourseId,
    TimeQuizStatus? Status,
    string? Cursor,
    int PageSize = 20
);

public enum TimeQuizStatus
{
    Active,
    Upcoming,
    Ended
}
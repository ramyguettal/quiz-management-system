using MediatR;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Reponses.QuizSubmissions;
using quiz_management_system.Contracts.Requests.UserSubmissions;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.QuizSubmissions.GetStudentSubmittedQuizzes;

public sealed record GetStudentSubmittedQuizzesQuery(
    Guid StudentId,
    string? Cursor,
    int PageSize,
    Guid? CourseId,
    SubmissionStatusFilter? Status
) : IRequest<Result<CursorPagedResponse<StudentSubmittedQuizResponse>>>;

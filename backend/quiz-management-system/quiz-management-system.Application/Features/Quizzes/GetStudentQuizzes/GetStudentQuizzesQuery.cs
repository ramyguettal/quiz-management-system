using MediatR;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Reponses.Quizzes;
using quiz_management_system.Contracts.Requests.Student;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Quizzes.GetStudentQuizzes;

public sealed record GetStudentQuizzesQuery(
    Guid? CourseId,
    TimeQuizStatus? Status,
    string? Cursor,
    int PageSize = 20
) : IRequest<Result<CursorPagedResponse<QuizListItemResponse>>>;
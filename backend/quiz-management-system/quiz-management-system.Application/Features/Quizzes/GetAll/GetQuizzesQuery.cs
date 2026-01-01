using MediatR;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Reponses.Quizzes;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Quizzes.GetAll;

public record GetQuizzesQuery(
    Guid? CourseId,
    Guid? InstructorId,
    Guid? AcademicYearId,
    string? Status,
    string? Cursor,
    int PageSize
) : IRequest<Result<CursorPagedResponse<QuizListItemResponse>>>;

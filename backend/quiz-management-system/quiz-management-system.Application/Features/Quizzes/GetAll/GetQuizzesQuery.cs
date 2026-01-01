using MediatR;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Reponses.Quizzes;
using quiz_management_system.Domain.Common.ResultPattern.Result;

namespace quiz_management_system.Application.Features.Quizzes.GetAll;

public record GetQuizzesQuery(
    Guid? CourseId = null,
    Guid? InstructorId = null,
    Guid? AcademicYearId = null,
    string? Status = null,
    string? Cursor = null,
    int PageSize = 20
) : IRequest<Result<CursorPagedResponse<QuizListItemResponse>>>;

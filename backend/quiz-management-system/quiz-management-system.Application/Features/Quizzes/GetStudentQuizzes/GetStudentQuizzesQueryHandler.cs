using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Application.Features.Quizzes.GetAll;
using quiz_management_system.Application.Interfaces;
using quiz_management_system.Contracts.Common;
using quiz_management_system.Contracts.Reponses.Quizzes;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.Enums;
using quiz_management_system.Domain.Users.StudentsFolder;

namespace quiz_management_system.Application.Features.Quizzes.GetStudentQuizzes;

public sealed class GetStudentQuizzesQueryHandler(
    ISender sender,
    IUserContext userContext,
    IAppDbContext context
) : IRequestHandler<GetStudentQuizzesQuery, Result<CursorPagedResponse<QuizListItemResponse>>>
{
    public async Task<Result<CursorPagedResponse<QuizListItemResponse>>> Handle(
        GetStudentQuizzesQuery request,
        CancellationToken ct)
    {
        Guid studentId = userContext.UserId!.Value;

        var student = await context.Students
            .Include(s => s.AcademicYearId)
            .FirstOrDefaultAsync(s => s.Id == studentId, ct);

        if (student is null)
            return Result.Failure<CursorPagedResponse<QuizListItemResponse>>(
                DomainError.NotFound(nameof(Student))
            );

        var quizQuery = new GetQuizzesQuery(
            CourseId: request.CourseId,
            InstructorId: null,
            AcademicYearId: student.AcademicYearId,
            QuizStatus: QuizStatus.Published,
            TimeStatus: request.Status,
            Cursor: request.Cursor,
            PageSize: request.PageSize
        );

        return await sender.Send(quizQuery, ct);
    }
}

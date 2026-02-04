using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.UserSubmission.Enums;

namespace quiz_management_system.Application.Features.QuizSubmissions.GetStudentQuizCount;

public sealed class GetStudentQuizCountQueryHandler(IAppDbContext _context)
    : IRequestHandler<GetStudentQuizCountQuery, Result<int>>
{
    public async Task<Result<int>> Handle(
        GetStudentQuizCountQuery request,
        CancellationToken ct)
    {
        // Count distinct quizzes that the student has submitted (not just started)
        var count = await _context.QuizSubmissions
            .AsNoTracking()
            .Where(s => s.StudentId == request.StudentId)
            .Where(s => s.Status == SubmissionStatus.Submitted)
            .Select(s => s.QuizId)
            .Distinct()
            .CountAsync(ct);

        return Result.Success(count);
    }
}

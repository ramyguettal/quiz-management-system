using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder;

namespace quiz_management_system.Application.Features.QuizSubmissions.ReleaseResults;

public class ReleaseResultsCommandHandler(IAppDbContext _context)
    : IRequestHandler<ReleaseResultsCommand, Result>
{
    public async Task<Result> Handle(
        ReleaseResultsCommand request,
        CancellationToken ct)
    {
        var quiz = await _context.Quizzes
            .FirstOrDefaultAsync(q => q.Id == request.QuizId, ct);

        if (quiz == null)
            return Result.Failure(
                DomainError.NotFound(nameof(Quiz), request.QuizId));

        var result = quiz.ReleaseResults();

        if (result.IsFailure)
            return result;

        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}
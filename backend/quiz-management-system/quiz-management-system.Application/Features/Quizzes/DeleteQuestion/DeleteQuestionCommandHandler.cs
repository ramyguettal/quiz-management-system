using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.Abstraction;

namespace quiz_management_system.Application.Features.Quizzes.DeleteQuestion;

public class DeleteQuestionCommandHandler(IAppDbContext _context)
    : IRequestHandler<DeleteQuestionCommand, Result>
{
    public async Task<Result> Handle(DeleteQuestionCommand request, CancellationToken ct)
    {
        // 1️⃣ Get question order + quiz id (minimal projection)
        var questionInfo = await _context.QuizQuestions
            .Where(q => q.Id == request.QuestionId)
            .Select(q => new { q.Id, q.Order, q.QuizId })
            .FirstOrDefaultAsync(ct);

        if (questionInfo == null)
        {
            return Result.Failure(
                DomainError.NotFound(nameof(QuizQuestion), request.QuestionId));
        }

        // 2️⃣ Delete the question
        await _context.QuizQuestions
            .Where(q => q.Id == request.QuestionId)
            .ExecuteDeleteAsync(ct);

        // 3️⃣ Shift orders back
        await _context.QuizQuestions
            .Where(q =>
                q.QuizId == questionInfo.QuizId &&
                q.Order > questionInfo.Order)
            .ExecuteUpdateAsync(setters =>
                setters.SetProperty(
                    q => q.Order,
                    q => q.Order - 1),
                ct);

        return Result.Success();
    }
}

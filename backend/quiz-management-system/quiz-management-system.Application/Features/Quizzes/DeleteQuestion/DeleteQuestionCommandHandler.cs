using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.Abstraction;

namespace quiz_management_system.Application.Features.Quizzes.DeleteQuestion;

public class DeleteQuestionCommandHandler(IAppDbContext _context) : IRequestHandler<DeleteQuestionCommand, Result>
{


    public async Task<Result> Handle(DeleteQuestionCommand request, CancellationToken ct)
    {
        var deletedCount = await _context.QuizQuestions
            .Where(q => q.Id == request.QuestionId)
            .ExecuteDeleteAsync(ct);

        if (deletedCount == 0)
            return Result.Failure(
                DomainError.NotFound(nameof(QuizQuestion), request.QuestionId));

        return Result.Success();
    }
}

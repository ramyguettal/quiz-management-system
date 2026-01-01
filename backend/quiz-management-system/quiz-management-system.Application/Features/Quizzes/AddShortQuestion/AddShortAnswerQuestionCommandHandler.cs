using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder;

namespace quiz_management_system.Application.Features.Quizzes.AddShortQuestion;

public class AddShortAnswerQuestionCommandHandler(IAppDbContext _context)
    : IRequestHandler<AddShortAnswerQuestionCommand, Result<Guid>>
{


    public async Task<Result<Guid>> Handle(
        AddShortAnswerQuestionCommand request,
        CancellationToken ct)
    {
        var quiz = await _context.Quizzes
            .FirstOrDefaultAsync(q => q.Id == request.QuizId, ct);

        if (quiz == null)
            return Result.Failure<Guid>(DomainError.NotFound(nameof(Quiz), request.QuizId));

        var questionResult = quiz.AddShortAnswerQuestion(
            request.Text,
            request.Points,
            request.IsTimed,
            request.TimeLimitInMinutes,
            request.ExpectedAnswer
        );

        if (questionResult.IsFailure)
            return Result.Failure<Guid>(questionResult.TryGetError());
        await _context.ShortAnswerQuestions.AddAsync(questionResult.TryGetValue());
        await _context.SaveChangesAsync(ct);
        return Result.Success(questionResult.TryGetValue().Id);
    }
}

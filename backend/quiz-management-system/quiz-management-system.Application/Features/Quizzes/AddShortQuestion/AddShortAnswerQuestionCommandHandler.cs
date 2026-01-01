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
        // Load quiz with questions to calculate order
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == request.QuizId, ct);

        if (quiz == null)
            return Result.Failure<Guid>(DomainError.NotFound(nameof(Quiz), request.QuizId));

        // Calculate next order (max order + 1, or 1 if no questions)
        int nextOrder = quiz.Questions.Any()
            ? quiz.Questions.Max(q => q.Order) + 1
            : 1;

        var questionResult = quiz.AddShortAnswerQuestion(
            request.Text,
            request.Points,
            request.IsTimed,
            request.TimeLimitInMinutes,
            request.ExpectedAnswer
        );

        if (questionResult.IsFailure)
            return Result.Failure<Guid>(questionResult.TryGetError());

        var question = questionResult.TryGetValue();

        // Set the correct order
        question.SetOrder(nextOrder);

        await _context.ShortAnswerQuestions.AddAsync(question);
        await _context.SaveChangesAsync(ct);

        return Result.Success(question.Id);
    }
}
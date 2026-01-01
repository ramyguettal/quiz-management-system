using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;
using quiz_management_system.Domain.QuizesFolder.QuizOptionFolder;

namespace quiz_management_system.Application.Features.Quizzes.AddMultipleChoiceQuestion;

public class AddMultipleChoiceQuestionCommandHandler(IAppDbContext _context)
    : IRequestHandler<AddMultipleChoiceQuestionCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(
        AddMultipleChoiceQuestionCommand request,
        CancellationToken ct)
    {
        // Load quiz with questions to calculate order
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == request.QuizId, ct);

        if (quiz == null)
            return Result.Failure<Guid>(DomainError.NotFound(nameof(Quiz), request.QuizId));

        // Validate options before adding question
        if (request.Options?.Any() != true)
            return Result.Failure<Guid>(
                DomainError.InvalidState(nameof(MultipleChoiceQuestion),
                    "At least one option is required"));

        if (!request.Options.Any(o => o.IsCorrect))
            return Result.Failure<Guid>(
                DomainError.InvalidState(nameof(MultipleChoiceQuestion),
                    "At least one correct option is required"));

        // Calculate next order (max order + 1, or 1 if no questions)
        int nextOrder = quiz.Questions.Any()
            ? quiz.Questions.Max(q => q.Order) + 1
            : 1;

        // Add question using domain
        var questionResult = quiz.AddMultipleChoiceQuestion(
            request.Text,
            request.Points,
            request.ShuffleOptions
        );

        if (questionResult.IsFailure)
            return Result.Failure<Guid>(questionResult.TryGetError());

        var question = questionResult.TryGetValue();

        // Set the correct order
        question.SetOrder(nextOrder);

        await _context.MultipleChoiceQuestions.AddAsync(question);

        // Add options
        List<QuestionOption> questionOptions = [];
        foreach (var option in request.Options)
        {
            var optionResult = question.AddOption(option.Text, option.IsCorrect);
            if (optionResult.IsFailure)
                return Result.Failure<Guid>(optionResult.TryGetError());

            questionOptions.Add(optionResult.TryGetValue());
        }

        await _context.QuestionOptions.AddRangeAsync(questionOptions);
        await _context.SaveChangesAsync(ct);

        return Result.Success(question.Id);
    }
}
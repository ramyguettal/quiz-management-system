using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;
using quiz_management_system.Domain.QuizesFolder.QuizOptionFolder;

namespace quiz_management_system.Application.Features.Quizzes.UpdateMultipleChoiceQuestion;

public class UpdateMultipleChoiceQuestionCommandHandler(IAppDbContext _context)
    : IRequestHandler<UpdateMultipleChoiceQuestionCommand, Result>
{
    public async Task<Result> Handle(
        UpdateMultipleChoiceQuestionCommand request,
        CancellationToken ct)
    {
        // Start a transaction
        await using var transaction = await _context.Database.BeginTransactionAsync(ct);

        try
        {
            var question = await _context.MultipleChoiceQuestions
                .Include(q => q.Options)
                .FirstOrDefaultAsync(q => q.Id == request.QuestionId, ct);

            if (question == null)
                return Result.Failure(
                    DomainError.NotFound(nameof(MultipleChoiceQuestion), request.QuestionId));

            // Update text
            var textResult = question.UpdateText(request.Text);
            if (textResult.IsFailure)
                return textResult;

            // Update points
            var pointsResult = question.UpdatePoints(request.Points);
            if (pointsResult.IsFailure)
                return pointsResult;

            // Update timing



            // --- Replace options ---
            // Delete existing options directly in DB
            await _context.QuestionOptions
                .Where(o => o.QuestionId == question.Id)
                .ExecuteDeleteAsync(ct);

            if (request.Options?.Any() != true)
                return Result.Failure(
                    DomainError.InvalidState(nameof(MultipleChoiceQuestion),
                        "At least one option is required"));

            if (!request.Options.Any(o => o.IsCorrect))
                return Result.Failure(
                    DomainError.InvalidState(nameof(MultipleChoiceQuestion),
                        "At least one correct option is required"));

            List<QuestionOption> questionOptions = new();

            // Add new options
            foreach (var optionDto in request.Options)
            {
                var optionResult = question.AddOption(optionDto.Text, optionDto.IsCorrect);
                if (optionResult.IsFailure)
                    return optionResult;

                questionOptions.Add(optionResult.TryGetValue());
            }

            await _context.QuestionOptions.AddRangeAsync(questionOptions);
            await _context.SaveChangesAsync(ct);

            // Commit transaction
            await transaction.CommitAsync(ct);

            return Result.Success();
        }
        catch
        {
            // Rollback transaction if anything fails
            await transaction.RollbackAsync(ct);
            throw;
        }
    }
}
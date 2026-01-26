using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;

namespace quiz_management_system.Application.Features.Quizzes.UpdateShortAnswerQuestion;

public class UpdateShortAnswerQuestionCommandHandler(IAppDbContext _context)
    : IRequestHandler<UpdateShortAnswerQuestionCommand, Result>
{



    public async Task<Result> Handle(
        UpdateShortAnswerQuestionCommand request,
        CancellationToken ct)
    {
        var question = await _context.ShortAnswerQuestions
            .FirstOrDefaultAsync(q => q.Id == request.QuestionId, ct);

        if (question == null)
            return Result.Failure(
                DomainError.NotFound(nameof(ShortAnswerQuestion), request.QuestionId));

        // Update text
        var textResult = question.UpdateText(request.Text);
        if (textResult.IsFailure)
            return textResult;

        // Update points
        var pointsResult = question.UpdatePoints(request.Points);
        if (pointsResult.IsFailure)
            return pointsResult;


        // Update expected answer
        if (!string.IsNullOrWhiteSpace(request.ExpectedAnswer))
        {
            var answerResult = question.UpdateAnswer(request.ExpectedAnswer);
            if (answerResult.IsFailure)
                return answerResult;
        }

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
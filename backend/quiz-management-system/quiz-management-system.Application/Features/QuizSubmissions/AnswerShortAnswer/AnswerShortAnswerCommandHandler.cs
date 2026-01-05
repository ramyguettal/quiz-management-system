using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;
using quiz_management_system.Domain.UserSubmission;

namespace quiz_management_system.Application.Features.QuizSubmissions.AnswerShortAnswer;

public class AnswerShortAnswerCommandHandler(IAppDbContext _context)
    : IRequestHandler<AnswerShortAnswerCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(
        AnswerShortAnswerCommand request,
        CancellationToken ct)
    {
        var submission = await _context.QuizSubmissions
            .Include(s => s.Quiz)
                .ThenInclude(q => q.Questions)
            .Include(s => s.Answers)
            .FirstOrDefaultAsync(s => s.Id == request.SubmissionId, ct);

        if (submission == null)
            return Result.Failure<Guid>(
                DomainError.NotFound(nameof(QuizSubmission), request.SubmissionId));

        var question = await _context.ShortAnswerQuestions
            .FirstOrDefaultAsync(q => q.Id == request.QuestionId, ct);

        if (question == null)
            return Result.Failure<Guid>(
                DomainError.NotFound(nameof(ShortAnswerQuestion), request.QuestionId));

        // ✅ Check if answer already exists for this question
        var existingAnswer = submission.Answers
            .OfType<ShortAnswer>()
            .FirstOrDefault(a => a.QuestionId == request.QuestionId);

        if (existingAnswer != null)
        {
            // Check if editing is allowed
            if (!submission.Quiz.AllowEditAfterSubmission)
                return Result.Failure<Guid>(
                    DomainError.InvalidState(nameof(QuizSubmission),
                        "Cannot change answer. Editing is not allowed for this quiz."));

            //  Remove existing answer
            _context.ShortAnswers.Remove(existingAnswer);
        }

        //  Create new answer (domain method handles validation and adding to collection)
        var answerResult = submission.AnswerShortAnswer(question, request.AnswerText);

        if (answerResult.IsFailure)
            return Result.Failure<Guid>(answerResult.TryGetError());

        var answer = answerResult.TryGetValue();

        //  Add new answer
        await _context.ShortAnswers.AddAsync(answer, ct);
        await _context.SaveChangesAsync(ct);

        return Result.Success(answer.Id);
    }
}
using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;
using quiz_management_system.Domain.UserSubmission;
using quiz_management_system.Domain.UserSubmission.Answers;

namespace quiz_management_system.Application.Features.QuizSubmissions.AddMultipleQuestionAnswer;

public class AnswerMultipleChoiceCommandHandler(IAppDbContext _context)
    : IRequestHandler<AnswerMultipleChoiceCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(
     AnswerMultipleChoiceCommand request,
     CancellationToken ct)
    {
        var submission = await _context.QuizSubmissions
            .Include(s => s.Quiz)
                .ThenInclude(q => q.Questions)
            .Include(s => s.Answers)
                .ThenInclude(a => (a as MultipleChoiceAnswer).SelectedOptions)
            .FirstOrDefaultAsync(s => s.Id == request.SubmissionId, ct);

        if (submission == null)
            return Result.Failure<Guid>(
                DomainError.NotFound(nameof(QuizSubmission), request.SubmissionId));

        var question = await _context.MultipleChoiceQuestions
            .Include(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == request.QuestionId, ct);

        if (question == null)
            return Result.Failure<Guid>(
                DomainError.NotFound(nameof(MultipleChoiceQuestion), request.QuestionId));

        var existingAnswer = submission.Answers
            .OfType<MultipleChoiceAnswer>()
            .FirstOrDefault(a => a.QuestionId == request.QuestionId);

        // 🔹 EDIT EXISTING ANSWER
        if (existingAnswer != null)
        {
            if (!submission.Quiz.AllowEditAfterSubmission)
                return Result.Failure<Guid>(
                    DomainError.InvalidState(
                        nameof(QuizSubmission),
                        "Cannot change answer. Editing is not allowed for this quiz."));

            _context.MultipleChoiceAnswers.Remove(existingAnswer);
        }

        //  CREATE NEW ANSWER 
        var answerResult = submission.AnswerMultipleChoice(
            question,
            request.SelectedOptionIds);

        if (answerResult.IsFailure)
            return Result.Failure<Guid>(answerResult.TryGetError());

        var answer = answerResult.TryGetValue();

        await _context.MultipleChoiceAnswers.AddAsync(answer, ct);
        await _context.SaveChangesAsync(ct);

        return Result.Success(answer.Id);
    }

}

using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Reponses.QuizSubmissions;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;
using quiz_management_system.Domain.UserSubmission;
using quiz_management_system.Domain.UserSubmission.Answers;

namespace quiz_management_system.Application.Features.QuizSubmissions.SubmitQuiz;

public class SubmitQuizCommandHandler(IAppDbContext _context)
    : IRequestHandler<SubmitQuizCommand, Result<UserSubmittedResponse>>
{
    public async Task<Result<UserSubmittedResponse>> Handle(
      SubmitQuizCommand request,
      CancellationToken ct)
    {
        var submission = await _context.QuizSubmissions
            .Include(s => s.Quiz)
            .Include(s => s.Student)

            // Load all answers with their questions
            .Include(s => s.Answers)
                .ThenInclude(a => a.Question)

            // Load MultipleChoice-specific data
            .Include(s => s.Answers)
                .ThenInclude(a => (a as MultipleChoiceAnswer).SelectedOptions)
                    .ThenInclude(o => o.SelectedOption)

            // Load MultipleChoice question options
            .Include(s => s.Answers)
                .ThenInclude(a => a.Question)
                    .ThenInclude(q => (q as MultipleChoiceQuestion).Options)

            .FirstOrDefaultAsync(s => s.Id == request.SubmissionId, ct);

        if (submission == null)
            return Result.Failure<UserSubmittedResponse>(
                DomainError.NotFound(nameof(QuizSubmission), request.SubmissionId));

        var submitResult = submission.Submit();
        if (submitResult.IsFailure)
            return Result.Failure<UserSubmittedResponse>(submitResult.TryGetError());

        var gradeResult = submission.Grade();
        if (gradeResult.IsFailure)
            return Result.Failure<UserSubmittedResponse>(gradeResult.TryGetError());

        // IMPORTANT: Save changes BEFORE returning
        await _context.SaveChangesAsync(ct);

        return Result.Success(new UserSubmittedResponse(submission.Quiz.ShowResultsImmediately));
    }
}

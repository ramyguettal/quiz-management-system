using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Reponses.QuizSubmissions;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.Enums;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;
using quiz_management_system.Domain.UserSubmission;
using quiz_management_system.Domain.UserSubmission.Answers;

namespace quiz_management_system.Application.Features.QuizSubmissions.GetSubmissionResults;

public class GetSubmissionResultsQueryHandler(IAppDbContext _context)
    : IRequestHandler<GetSubmissionResultsQuery, Result<SubmissionResultResponse>>
{
    public async Task<Result<SubmissionResultResponse>> Handle(
        GetSubmissionResultsQuery request,
        CancellationToken ct)
    {
        // Single query with all necessary includes to avoid N+1
        var submission = await _context.QuizSubmissions
            .AsNoTracking()
            .Include(s => s.Quiz)
            .Include(s => s.Student)
            .Include(s => s.Answers)
                .ThenInclude(a => (a as MultipleChoiceAnswer).SelectedOptions)
                    .ThenInclude(o => o.SelectedOption)
            .Include(s => s.Answers)
                .ThenInclude(a => a.Question)
                    .ThenInclude(q => (q as MultipleChoiceQuestion).Options)
            .FirstOrDefaultAsync(s => s.Id == request.SubmissionId, ct);

        if (submission == null)
            return Result.Failure<SubmissionResultResponse>(
                DomainError.NotFound(nameof(QuizSubmission), request.SubmissionId));

        // Only allow results for released quizzes
        if (submission.Quiz.Status != QuizStatus.Closed)
            return Result.Failure<SubmissionResultResponse>(
                DomainError.InvalidState(nameof(QuizSubmission),
                    "Results are only available for closed quizzes."));

        if (!submission.Quiz.ShowResultsImmediately && !submission.Quiz.ResultsReleased)
            return Result.Failure<SubmissionResultResponse>(
                DomainError.InvalidState(nameof(QuizSubmission),
                    "Results have not been released yet."));

        // Map answers with question order
        var answerResults = submission.Answers
            .OrderBy(a => a.Question.Order)
            .Select(a => MapAnswerResultToDto(a))
            .ToList();

        var response = new SubmissionResultResponse(
            submission.Id,
            submission.QuizId,
            submission.Quiz.Title,
            submission.StudentId,
            submission.Student.FullName,
            submission.StartedAtUtc,
            submission.SubmittedAtUtc ?? submission.StartedAtUtc,
            submission.GradedAtUtc ?? submission.SubmittedAtUtc ?? submission.StartedAtUtc,
            submission.RawScore,
            submission.MaxScore,
            submission.ScaledScore,
            submission.Percentage,
            answerResults
        );

        return Result.Success(response);
    }

    private static AnswerResultDto MapAnswerResultToDto(
        Domain.UserSubmission.Answers.Abstraction.QuestionAnswer answer)
    {
        var question = answer.Question;

        if (answer is MultipleChoiceAnswer mcAnswer)
        {
            var mcQuestion = (MultipleChoiceQuestion)question;

            // Get selected option IDs for quick lookup
            var selectedOptionIds = mcAnswer.SelectedOptions
                .Select(o => o.SelectedOptionId)
                .ToHashSet();

            // Map ALL options with IsCorrect and IsSelected flags
            var allOptions = mcQuestion.Options
                .Select(o => new OptionResultDetail(
                    o.Id,
                    o.Text,
                    o.IsCorrect,
                    selectedOptionIds.Contains(o.Id)))
                .ToList();

            var correctOptionIds = mcQuestion.Options
                .Where(o => o.IsCorrect)
                .Select(o => o.Id)
                .ToList();

            return new AnswerResultDto(
                answer.QuestionId,
                question.Text,
                "MultipleChoice",
                question.Order,
                answer.QuestionPoints,
                answer.PointsEarned,
                answer.IsCorrect,
                allOptions,
                selectedOptionIds.ToList(),
                correctOptionIds,
                null,
                null,
                null
            );
        }
        else if (answer is ShortAnswer saAnswer)
        {
            var saQuestion = (ShortAnswerQuestion)question;

            return new AnswerResultDto(
                answer.QuestionId,
                question.Text,
                "ShortAnswer",
                question.Order,
                answer.QuestionPoints,
                answer.PointsEarned,
                answer.IsCorrect,
                null,
                null,
                null,
                saAnswer.AnswerText,
                saAnswer.SimilarityScore,
                saQuestion.ExpectedAnswer
            );
        }

        throw new InvalidOperationException("Unknown answer type");
    }
}
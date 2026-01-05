using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Reponses.QuizSubmissions;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
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
        var submission = await _context.QuizSubmissions
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

        if (submission.Status != Domain.UserSubmission.Enums.SubmissionStatus.Graded)
            return Result.Failure<SubmissionResultResponse>(
                DomainError.InvalidState(nameof(QuizSubmission),
                    "Submission has not been graded yet."));

        if (!submission.Quiz.ShowResultsImmediately && !submission.Quiz.ResultsReleased)
            return Result.Failure<SubmissionResultResponse>(
                DomainError.InvalidState(nameof(QuizSubmission),
                    "Results have not been released yet."));

        var response = new SubmissionResultResponse(
            submission.Id,
            submission.QuizId,
            submission.Quiz.Title,
            submission.StudentId,
            submission.Student.FullName,
            submission.StartedAtUtc,
            submission.SubmittedAtUtc!.Value,
            submission.GradedAtUtc!.Value,
            submission.RawScore,
            submission.MaxScore,
            submission.ScaledScore,
            submission.Percentage,
            submission.Answers.Select(MapAnswerResultToDto).ToList()
        );

        return Result.Success(response);
    }

    private AnswerResultDto MapAnswerResultToDto(
        Domain.UserSubmission.Answers.Abstraction.QuestionAnswer answer)
    {
        var question = answer.Question;

        if (answer is MultipleChoiceAnswer mcAnswer)
        {
            var mcQuestion = (MultipleChoiceQuestion)question;
            var correctOptions = mcQuestion.Options.Where(o => o.IsCorrect).ToList();

            // ✅ Get selected option IDs from OptionAnswers collection
            var selectedOptionIds = mcAnswer.SelectedOptions
                .Select(o => o.SelectedOptionId)
                .ToList();

            // ✅ Map to SelectedOptionDetail using the SelectedOption navigation property
            var selectedOptions = mcAnswer.SelectedOptions
                .Select(o => new SelectedOptionDetail(
                    o.SelectedOption.Id,
                    o.SelectedOption.Text,
                    o.SelectedOption.IsCorrect))
                .ToList();

            var correctOptionDetails = correctOptions
                .Select(o => new CorrectOptionDetail(o.Id, o.Text))
                .ToList();

            return new AnswerResultDto(
                answer.QuestionId,
                question.Text,
                "MultipleChoice",
                answer.QuestionPoints,
                answer.PointsEarned,
                answer.IsCorrect,
                selectedOptionIds,
                selectedOptions,
                null,
                null,
                correctOptions.Select(o => o.Id).ToList(),
                correctOptionDetails,
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
                answer.QuestionPoints,
                answer.PointsEarned,
                answer.IsCorrect,
                null,
                null,
                saAnswer.AnswerText,
                saAnswer.SimilarityScore,
                null,
                null,
                saQuestion.ExpectedAnswer
            );
        }

        throw new InvalidOperationException("Unknown answer type");
    }
}
using MediatR;
using Microsoft.EntityFrameworkCore;
using quiz_management_system.Contracts.Reponses.QuizSubmissions;
using quiz_management_system.Contracts.Requests;
using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.Abstraction;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;
using quiz_management_system.Domain.UserSubmission;
using quiz_management_system.Domain.UserSubmission.Answers;
using quiz_management_system.Domain.UserSubmission.Answers.Abstraction;

namespace quiz_management_system.Application.Features.QuizSubmissions.GetCurrentSubmission;

public class GetCurrentSubmissionQueryHandler(IAppDbContext _context)
    : IRequestHandler<GetCurrentSubmissionQuery, Result<SubmissionEditResponse>>
{
    public async Task<Result<SubmissionEditResponse>> Handle(
        GetCurrentSubmissionQuery request,
        CancellationToken ct)
    {
        var submission = await _context.QuizSubmissions
            .Include(s => s.Quiz)
                .ThenInclude(q => q.Questions)
                    .ThenInclude(q => (q as MultipleChoiceQuestion).Options)
            .Include(s => s.Student)
            .Include(s => s.Answers)
                .ThenInclude(a => (a as MultipleChoiceAnswer).SelectedOptions)
            .FirstOrDefaultAsync(
                s => s.QuizId == request.QuizId
                && s.StudentId == request.StudentId
                && s.Status == Domain.UserSubmission.Enums.SubmissionStatus.InProgress,
                ct);

        if (submission == null)
            return Result.Failure<SubmissionEditResponse>(
                DomainError.NotFound(nameof(QuizSubmission), request.QuizId));

        // Map answers to dictionary for quick lookup
        var answersDict = submission.Answers.ToDictionary(a => a.QuestionId);

        var questionsWithAnswers = submission.Quiz.Questions
            .OrderBy(q => q.Order)
            .Select(q => MapQuestionWithAnswer(q, answersDict))
            .ToList();

        var response = new SubmissionEditResponse(
            SubmissionId: submission.Id,
            QuizId: submission.QuizId,
            QuizTitle: submission.Quiz.Title,
            QuizDescription: submission.Quiz.Description,
            StartedAtUtc: submission.StartedAtUtc,
            AllowEditAfterSubmission: submission.Quiz.AllowEditAfterSubmission,
            Questions: questionsWithAnswers
        );

        return Result.Success(response);
    }

    private static QuestionWithAnswerDto MapQuestionWithAnswer(
        QuizQuestion question,
        Dictionary<Guid, QuestionAnswer> answersDict)
    {
        // Try to get existing answer for this question
        answersDict.TryGetValue(question.Id, out var existingAnswer);

        if (question is MultipleChoiceQuestion mcQuestion)
        {
            var options = mcQuestion.Options
                .Select(o => new StudentOptionDto(o.Id, o.Text))
                .ToList();

            List<Guid>? currentSelectedOptionIds = null;
            if (existingAnswer is MultipleChoiceAnswer mcAnswer)
            {
                currentSelectedOptionIds = mcAnswer.SelectedOptions
                    .Select(o => o.SelectedOptionId)
                    .ToList();
            }

            return new QuestionWithAnswerDto(
                QuestionId: mcQuestion.Id,
                QuestionType: "MultipleChoice",
                Text: mcQuestion.Text,
                Points: mcQuestion.Points,
                Order: mcQuestion.Order,
                Options: options,
                ExpectedAnswer: null,
                CurrentSelectedOptionIds: currentSelectedOptionIds,
                CurrentAnswerText: null
            );
        }
        else if (question is ShortAnswerQuestion saQuestion)
        {
            string? currentAnswerText = null;
            if (existingAnswer is ShortAnswer saAnswer)
            {
                currentAnswerText = saAnswer.AnswerText;
            }

            return new QuestionWithAnswerDto(
                QuestionId: saQuestion.Id,
                QuestionType: "ShortAnswer",
                Text: saQuestion.Text,
                Points: saQuestion.Points,
                Order: saQuestion.Order,
                Options: null,
                ExpectedAnswer: null, // Don't expose to students
                CurrentSelectedOptionIds: null,
                CurrentAnswerText: currentAnswerText
            );
        }

        // Fallback for unknown question types
        return new QuestionWithAnswerDto(
            QuestionId: question.Id,
            QuestionType: "Unknown",
            Text: question.Text,
            Points: question.Points,
            Order: question.Order,
            Options: null,
            ExpectedAnswer: null,
            CurrentSelectedOptionIds: null,
            CurrentAnswerText: null
        );
    }
}
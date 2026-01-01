using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.QuestionsFolder;
using quiz_management_system.Domain.UserSubmission.Answers.Abstraction;
using quiz_management_system.Domain.UserSubmission.Helper;

namespace quiz_management_system.Domain.UserSubmission.Answers;

public sealed class ShortAnswer : QuestionAnswer
{
    public string AnswerText { get; private set; } = string.Empty;
    public decimal SimilarityScore { get; private set; } // 0.0 to 1.0

    private ShortAnswer() { } // EF Core

    private ShortAnswer(
        Guid id,
        QuizSubmission submission,
        ShortAnswerQuestion question,
        string answerText)
        : base(id, submission, question)
    {
        AnswerText = answerText?.Trim() ?? string.Empty;
    }

    public static Result<ShortAnswer> Create(
        Guid id,
        QuizSubmission submission,
        ShortAnswerQuestion question,
        string answerText)
    {
        if (id == Guid.Empty)
            return Result.Failure<ShortAnswer>(
                DomainError.InvalidState(nameof(ShortAnswer), "Id cannot be empty."));

        if (submission is null)
            return Result.Failure<ShortAnswer>(
                DomainError.InvalidState(nameof(ShortAnswer), "Submission is required."));

        if (question is null)
            return Result.Failure<ShortAnswer>(
                DomainError.InvalidState(nameof(ShortAnswer), "Question is required."));

        if (string.IsNullOrWhiteSpace(answerText))
            return Result.Failure<ShortAnswer>(
                DomainError.InvalidState(nameof(ShortAnswer), "Answer text cannot be empty."));

        var answer = new ShortAnswer(id, submission, question, answerText);
        return Result.Success(answer);
    }

    public void Grade()
    {
        var question = (ShortAnswerQuestion)Question;

        if (string.IsNullOrWhiteSpace(question.ExpectedAnswer))
        {
            // No expected answer - manual grading required
            SimilarityScore = 0;
            PointsEarned = 0;
            IsCorrect = false;
            return;
        }

        // Calculate similarity 
        SimilarityScore = TextSimilarityCalculator.CalculateSimilarity(
            AnswerText,
            question.ExpectedAnswer);

        // Points earned = similarity * max points
        PointsEarned = SimilarityScore * QuestionPoints;
        PointsEarned = Math.Round(PointsEarned, 2);

        // Consider correct if similarity >= 60%
        IsCorrect = SimilarityScore >= 0.60m;
    }

    public Result ManualGrade(decimal pointsEarned)
    {
        if (pointsEarned < 0 || pointsEarned > QuestionPoints)
            return Result.Failure(
                DomainError.InvalidState(nameof(ShortAnswer),
                    $"Points must be between 0 and {QuestionPoints}."));

        PointsEarned = pointsEarned;
        SimilarityScore = QuestionPoints > 0 ? pointsEarned / QuestionPoints : 0;
        IsCorrect = SimilarityScore >= 0.80m;

        return Result.Success();
    }
}
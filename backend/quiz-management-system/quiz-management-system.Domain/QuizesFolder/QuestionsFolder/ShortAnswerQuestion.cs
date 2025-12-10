using quiz_management_system.Domain.Common.ResultPattern.Error;
using quiz_management_system.Domain.Common.ResultPattern.Result;
using quiz_management_system.Domain.QuizesFolder.Abstraction;
using quiz_management_system.Domain.QuizesFolder.Enums;

namespace quiz_management_system.Domain.QuizesFolder.QuestionsFolder;

public sealed class ShortAnswerQuestion : QuizQuestion
{
    public ShortAnswerGradingMode GradingMode { get; private set; }
    public string? ExpectedAnswer { get; private set; }

    private ShortAnswerQuestion() { } // EF Core

    private ShortAnswerQuestion(
        Guid id,
        Quiz quiz,
        string text,
        int points,
        int order,
        bool isTimed,
        int? timeLimitInMinutes,
        ShortAnswerGradingMode gradingMode,
        string? expectedAnswer)
        : base(id, quiz, text, points, order, isTimed, timeLimitInMinutes)
    {
        GradingMode = gradingMode;
        ExpectedAnswer = expectedAnswer;
    }

    public static Result<ShortAnswerQuestion> Create(
        Guid id,
        Quiz quiz,
        string text,
        int points,
        int order,
        bool isTimed,
        int? timeLimitInMinutes,
        ShortAnswerGradingMode gradingMode,
        string? expectedAnswer)
    {
        Result validation = ValidateCommon(quiz, text, points, order, isTimed, timeLimitInMinutes);
        if (validation.IsFailure)
            return Result.Failure<ShortAnswerQuestion>(validation.TryGetError());

        if (gradingMode != ShortAnswerGradingMode.Manual &&
            string.IsNullOrWhiteSpace(expectedAnswer))
        {
            return Result.Failure<ShortAnswerQuestion>(
                DomainError.InvalidState(nameof(ShortAnswerQuestion),
                    "Auto-graded short answer questions must have an expected answer."));
        }

        ShortAnswerQuestion question = new ShortAnswerQuestion(
            id,
            quiz,
            text,
            points,
            order,
            isTimed,
            timeLimitInMinutes,
            gradingMode,
            expectedAnswer);

        return Result.Success(question);
    }

    public void SetGradingMode(ShortAnswerGradingMode mode, string? expectedAnswer)
    {
        GradingMode = mode;
        ExpectedAnswer = expectedAnswer;
    }
}